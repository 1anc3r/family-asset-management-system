const https = require('https');
const { pool } = require('../config/database');
const moment = require('moment');

// 支持的币种列表
const SUPPORTED_CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'HKD', 'GBP'];

/**
 * 从 exchangerate-api.com 获取最新汇率（免费版，以USD为基准）
 */
const fetchRatesFromAPI = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.rates) {
            resolve(json.rates);
          } else {
            reject(new Error('Invalid API response'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * 计算交叉汇率
 * 所有汇率先转换为以USD为中介，再计算两两之间的汇率
 */
const calculateCrossRates = (usdRates) => {
  const rates = {};
  
  // 只保留支持的币种
  const supportedRates = {};
  SUPPORTED_CURRENCIES.forEach(currency => {
    if (usdRates[currency]) {
      supportedRates[currency] = usdRates[currency];
    }
  });
  
  // 计算两两之间的汇率
  for (const from of Object.keys(supportedRates)) {
    for (const to of Object.keys(supportedRates)) {
      if (from === to) {
        rates[`${from}_${to}`] = 1.0;
      } else {
        // from -> USD -> to
        // rate = (1 / rate_from_USD) * rate_to_USD
        const rate = supportedRates[to] / supportedRates[from];
        rates[`${from}_${to}`] = parseFloat(rate.toFixed(6));
      }
    }
  }
  
  return rates;
};

/**
 * 更新数据库中的汇率
 */
const updateDatabaseRates = async (rates) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const [key, rate] of Object.entries(rates)) {
      const [from, to] = key.split('_');
      await connection.execute(
        `INSERT INTO exchange_rates (from_currency, to_currency, rate) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rate = ?, update_time = NOW()`,
        [from, to, rate, rate]
      );
    }
    
    await connection.commit();
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] 汇率自动更新成功，共更新 ${Object.keys(rates).length} 条记录`);
    return true;
  } catch (err) {
    await connection.rollback();
    console.error('汇率更新数据库失败:', err.message);
    return false;
  } finally {
    connection.release();
  }
};

/**
 * 执行汇率更新
 */
const updateRates = async () => {
  try {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] 开始自动更新汇率...`);
    const usdRates = await fetchRatesFromAPI();
    const crossRates = calculateCrossRates(usdRates);
    await updateDatabaseRates(crossRates);
    return true;
  } catch (err) {
    console.error('自动更新汇率失败:', err.message);
    return false;
  }
};

/**
 * 启动自动更新定时任务（每6小时执行一次）
 */
const startAutoUpdate = () => {
  // 立即执行一次
  updateRates();
  
  // 每6小时执行一次 (6 * 60 * 60 * 1000 = 21600000 ms)
  const INTERVAL = 6 * 60 * 60 * 1000;
  setInterval(updateRates, INTERVAL);
  
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] 汇率自动更新服务已启动，每6小时更新一次`);
};

/**
 * 停止自动更新
 */
let timer = null;
const startAutoUpdateWithTimer = () => {
  // 先执行一次
  updateRates();
  
  // 每6小时
  const INTERVAL = 6 * 60 * 60 * 1000;
  timer = setInterval(updateRates, INTERVAL);
  
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] 汇率自动更新服务已启动，每6小时更新一次`);
};

const stopAutoUpdate = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('汇率自动更新服务已停止');
  }
};

module.exports = {
  updateRates,
  startAutoUpdate: startAutoUpdateWithTimer,
  stopAutoUpdate
};
