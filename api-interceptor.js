/**
 * Class helps to manage the api calls, and there queue state.
 * @author Ravi Kumar sha
 * @email ravisha96@gmail.com
 */

import axios from 'axios';
class Fetch {
    constructor() {
        this.observer = [];
    }

    addNewUrl(url) {
        this.observer.push(url);
    }

    /**
     * Method tells any request is pending or not.
     */
    isPendingRequest() {
        return !!this.observer.length;
    }

    removeOldUrl(url) {
        this.observer.splice(
            this.observer.indexOf(url),
            1
        );
    }

    queryParamsBuilder(queryParams) {
        const keys = Object.keys(queryParams);
        let query = '?';

        if (!keys) {
            return '';
        }

        keys.forEach(key => query += `${key}=${queryParams[key]}&`);
        return query.slice(0, -1);
    }

    argumentMapper(params) {
        const [method, url, auth] = params;
        return {
            method,
            url,
            param: (params.length === 6) ? params[3] : null,
            auth,
            reject: params[params.length - 1],
            resolve: params[params.length - 2]
        }
    }

    ajax() {
        const { method, url, param, auth, resolve, reject } = this.argumentMapper(arguments);
        axios[method](url, param, auth).then(response => {
            this.removeOldUrl(url);
            resolve(response);
        }, error => {
            this.removeOldUrl(url);
            reject(error);
        });
    }

    /**
     * Method will be used to make a get api call.
     * @param  {String} url            Api URL
     * @param  {Object} queryParams    Url query params
     * @param  {Object} auth           Additional request params (headers, etc.)
     * @return {Object}                Promise Object
     */
    get(url, queryParams = {}, auth = {}) {
        const queryParamsUrl = `${url}${this.queryParamsBuilder(queryParams)}`;
        this.addNewUrl(queryParamsUrl);
        return new Promise(this.ajax.bind(this, 'get', queryParamsUrl, auth));
    }

    /**
     * Method can be used as post/put/update/delete, by passing the method name.
     * @param  {String} url            Api URL
     * @param  {String} post           Request Type [post/put/update]
     * @param  {Object} param          Params to be saved
     * @param  {Object} auth           Additional request params (headers, etc.)
     * @return {Object}                Promise Object
     */
    post(url, method = 'post', param = {}, auth = {}) {
        this.addNewUrl(url);
        return new Promise(this.ajax.bind(this, method, url, auth, param))
    }
}

export default new Fetch();
