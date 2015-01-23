function UniversalAnalyticsPlugin() {}

UniversalAnalyticsPlugin.prototype.startTrackerWithId = function(id, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'startTrackerWithId', [id]);
};

UniversalAnalyticsPlugin.prototype.setUserId = function(id, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'setUserId', [id]);
};

/* enables verbose logging */
UniversalAnalyticsPlugin.prototype.debugMode = function(success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'debugMode', []);
};

UniversalAnalyticsPlugin.prototype.trackView = function(screen, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'trackView', [screen]);
};

UniversalAnalyticsPlugin.prototype.addCustomDimension = function(key, value, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'addCustomDimension', [key, value]);
};

UniversalAnalyticsPlugin.prototype.trackEvent = function(category, action, label, value, success, error) {
  if (typeof label === 'undefined' || label === null) {
    label = '';
  }
  if (typeof value === 'undefined' || value === null) {
    value = 0;
  }

  cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'trackEvent', [category, action, label, value]);
};

/**
 * https://developers.google.com/analytics/devguides/collection/android/v3/exceptions
 */
UniversalAnalyticsPlugin.prototype.trackException = function(description, fatal, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'trackException', [description, fatal]);
};

UniversalAnalyticsPlugin.prototype.trackTiming = function(category, intervalInMilliseconds, name, label, success, error) {
  if (typeof intervalInMilliseconds === 'undefined' || intervalInMilliseconds === null) {
    intervalInMilliseconds = 0;
  }
  if (typeof name === 'undefined' || name === null) {
    name = '';
  }
  if (typeof label === 'undefined' || label === null) {
    label = '';
  }

  cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'trackTiming', [category, intervalInMilliseconds, name, label]);
};

/* Google Analytics e-Commerce Tracking */
/* https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce */
UniversalAnalyticsPlugin.prototype.addTransaction = function(transactionId, affiliation, revenue, tax, shipping, currencyCode, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'addTransaction', [transactionId, affiliation, revenue, tax, shipping, currencyCode]);
};

UniversalAnalyticsPlugin.prototype.addTransactionItem = function(transactionId, name ,sku, category, price, quantity, currencyCode, success, error) {
    cordova.exec(success, error, 'UniversalAnalyticsPlugin', 'addTransactionItem', [transactionId, name, sku, category, price, quantity, currencyCode]);
};

module.exports = new UniversalAnalyticsPlugin();
