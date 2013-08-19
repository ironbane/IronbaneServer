/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/
var Class = require('../../common/class');

module.exports = function(db) {
    var Q = require('q'),
    log = require('util').log,
        _ = require('underscore');

    var Post = Class.extend({
        init: function(json) {
            _.extend(this, json || {});
        }
    });

    Post.save = function(post){
        var deferred = Q.defer();
        db.query('insert into forum_posts set ?', post, function(err, result) {
            if(err) {
                deferred.reject('error creating post');
                return;
            }
            deferred.resolve();
        });
        return deferred.promise;
    };

    Post.get = function(postId) {
        var deferred = Q.defer();

        db.query('select * from forum_posts where id=?', [postId], function(err, results) {
            if(err) {
                deferred.reject(err);
                return;
            }

            if(results.length === 0) {
                deferred.reject('post not found.');
                return;
            }

            deferred.resolve(new Post(results[0]));
        });

        return deferred.promise;
    };

    return Post;
};