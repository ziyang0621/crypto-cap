import _ from 'lodash';
import {
  FETCH_CRYPTO_LIST,
  SELECT_CRYPTO,
  FETCH_CHART_DATA,
  CLEAR_CHART_DATA
} from '../actions/types';
const IMAGE_URL = 'https://files.coinmarketcap.com/static/img/coins/32x32/';

export default function(
  state = {
    list: null,
    selectedCrypto: null,
    selectedChartData: null,
    error: null
  },
  action
) {
  const { type, list, crypto, chartData, error } = action;
  switch (type) {
    case SELECT_CRYPTO:
      return { ...state, selectedCrypto: crypto };
    case FETCH_CHART_DATA:
      return { ...state, selectedChartData: chartData };
    case CLEAR_CHART_DATA:
      return { ...state, selectedChartData: null };
    case FETCH_CRYPTO_LIST:
      let btcItem = {};
      let ethItem = {};
      _.forEach(list, item => {
        if (item.id === 'bitcoin') {
          btcItem = item;
        }

        if (item.id === 'ethereum') {
          ethItem = item;
        }
      });

      let cryptoList = _.forEach(list, item => {
        const imageFileName = item.id.replace(' ', '-') + '.png';
        item.image_url = IMAGE_URL + imageFileName;

        if (!_.isEmpty(btcItem)) {
          const btcPriceYesterday =
            parseFloat(btcItem.price_usd) /
            (1 + parseFloat(btcItem.percent_change_24h) / 100);
          const itemPriceInUsdYesterday =
            parseFloat(item.price_usd) /
            (1 + parseFloat(item.percent_change_24h) / 100);
          const itemPriceInBtcYesterday =
            itemPriceInUsdYesterday / btcPriceYesterday;
          const btcPercentDiff =
            (parseFloat(item.price_btc) / itemPriceInBtcYesterday - 1) * 100;
          item.price_yesterday_usd = itemPriceInUsdYesterday;
          item.price_yesterday_btc = itemPriceInBtcYesterday;
          item.price_btc = parseFloat(item.price_btc).toFixed(8);
          item.percent_change_24h_btc = btcPercentDiff.toFixed(2);
        }

        if (!_.isEmpty(ethItem)) {
          const ethPriceYesterday =
            parseFloat(ethItem.price_usd) /
            (1 + parseFloat(ethItem.percent_change_24h) / 100);
          const itemPriceInUsdYesterday =
            parseFloat(item.price_usd) /
            (1 + parseFloat(item.percent_change_24h) / 100);
          const itemPriceInEthYesterday =
            itemPriceInUsdYesterday / ethPriceYesterday;
          const itemPriceInEthToday =
            parseFloat(item.price_usd) / parseFloat(ethItem.price_usd);
          const ethPercentDiff =
            (itemPriceInEthToday / itemPriceInEthYesterday - 1) * 100;
          item.price_yesterday_usd = itemPriceInUsdYesterday;
          item.price_yesterday_eth = itemPriceInEthYesterday;
          item.price_eth = itemPriceInEthToday.toFixed(8);
          item.percent_change_24h_eth = ethPercentDiff.toFixed(2);
        }
      });
      return { ...state, list: cryptoList, error };
    default:
      return state;
  }
}
