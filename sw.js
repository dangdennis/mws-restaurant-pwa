/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
    {
        url: 'css/styles.css',
        revision: '958ec4b570fb51b828c880282f695fff',
    },
    {
        url: 'data/restaurants.json',
        revision: '4ba9d8355cee522235582ae2442e1c71',
    },
    {
        url: 'img/1.jpg',
        revision: 'cc074688becddd2725114187fba9471c',
    },
    {
        url: 'img/10.jpg',
        revision: '2bd68efbe70c926de6609946e359faa2',
    },
    {
        url: 'img/2.jpg',
        revision: '759b34e9a95647fbea0933207f8fc401',
    },
    {
        url: 'img/3.jpg',
        revision: '81ee36a32bcfeea00db09f9e08d56cd8',
    },
    {
        url: 'img/4.jpg',
        revision: '23f21d5c53cbd8b0fb2a37af79d0d37f',
    },
    {
        url: 'img/5.jpg',
        revision: '0a166f0f4e10c36882f97327b3835aec',
    },
    {
        url: 'img/6.jpg',
        revision: 'eaf1fec4ee66e121cadc608435fec72f',
    },
    {
        url: 'img/7.jpg',
        revision: 'bd0ac197c58cf9853dc49b6d1d7581cd',
    },
    {
        url: 'img/8.jpg',
        revision: '6e0e6fb335ba49a4a732591f79000bb4',
    },
    {
        url: 'img/9.jpg',
        revision: 'ba4260dee2806745957f4ac41a20fa72',
    },
    {
        url: 'index.html',
        revision: 'd74cd893562ab83bae01e960be103ca7',
    },
    {
        url: 'js/dbhelper.js',
        revision: 'ba43b7a6565f31c4334393fbc9b650f0',
    },
    {
        url: 'js/main.js',
        revision: '3798b96d0ea7c862ca3e53add5080d1d',
    },
    {
        url: 'js/restaurant_info.js',
        revision: 'a6ef1c5f21c7d14f22726181ba916fb8',
    },
    {
        url: 'README.md',
        revision: '90ad052e42198ea6bd09c9b0b0fab75c',
    },
    {
        url: 'restaurant.html',
        revision: 'dd4c97a3c0e001eb4aeccf2d32f5631d',
    },
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(new RegExp('restaurant.html'), ({ url, event, params }) => {
    // Response will be “A guide on Workbox”
    console.log(...arguments);
    console.log(url, event, params);
});
