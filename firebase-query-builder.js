import firebase from 'firebase';
import Utils from '../shared/scripts/utils';

class Db {

    /**
     * Method make a new entry in database.
     * @param string table where we are going to insert. 
     * @param object data to be inserted
     */
    post (table, data) {
        return new Promise((resolve, reject) => {
            firebase.database().ref().child(table).push(data)
                .then(() => resolve({isSuccess: true}), (error) => reject({isSuccess: false}))
        });
    }

    /**
     * Method will return the data once and then stop watching for any changes in db.
     * @param string table to get the data.
     */
    getOnce (table) {
        var response = [];
        return firebase.database().ref(table).once('value').then(snapshot => Utils.GetArrayDataType(snapshot));
    }

    /**
     * Method will remove the record from DB.
     * @param string identifier is mix of `table/uniqueId`
     * @param any uniqueId is the unique id of the records
     */
    delete (identifier) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(identifier).remove().then(snapshot => resolve({isSuccess: true}), (err) => reject({isSuccess: false}));
        });
    }

    /**
     * Method will return data stream whenver data is update in database.
     * @param string table to get the data stream.
     */
    getStream (table) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(table).on('value').then(snapshot => resolve(Utils.GetArrayDataType(snapshot)), (err) => reject(err));
        });
    }

    /**
     * Method will update the entry in database.
     * @param string identifier is mix of `table/uniqueId`
     * @param object data then will be updated in database. 
     */
    update (identifier, data) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(identifier).update(data).then(snapshot => resolve({isSuccess: true}), (err) => reject({isSuccess: false}));
        });
    }

    /**
     * Method will search user by its unique id.
     * @param string table.
     * @param string id unique id.
     */
    findById (table, id) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(table).child(id).once('value').then(snapshot => resolve(snapshot.val()), (err) => reject(err));
        });
    }

    /**
     * Method will return the matched data.
     * @param string table where data need to be filtred.
     * @param string key column name
     * @param string value column value to be matched 
     */
    find (table, key, value) {

        const query = (type) => {
            return new Promise((resolve, reject) => {
                firebase.database().ref(table).orderByChild(key)[type](value).once('value').then(snapshot => resolve(Utils.GetArrayDataType(snapshot)), (err) => reject(err));
            });
        }

        return {
            exact () {
                return query('equalTo')
            },
            startWith () {
                return query('startAt');
            },
            endWith () {
                return query('endAt');
            }
        }
    }

    /**
     * Method will perform DB search with multiple where clause. Where clause can be sent as key: value
     * pair. Where `key` will be the FIELD NAME in DB.
     * @param string table where data need to be filtred.
     * @param object query object.
     */
    findMultiple(table, query) {
        
        return new Promise((resolve, reject) => {
            const keys = _.keys(query);

            this.find(table, _.first(keys), query[_.first(keys)])
                .startWith()
                .then(response => {
                    resolve(Utils.FilterResponseQuery(response, query));
                });
        });
    }
}

export default new Db;