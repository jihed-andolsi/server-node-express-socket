var Config = require('./Config');
module.exports = {
    users: [],
    add(user){
        this.users.push(user)
    },
    get(){
        return this.users;
    },
    getMasterUser(){
        return this.users.find(s => s.role === Config.roles.master)
    },
    getWithExclude(user, callback){
        this.users.forEach((s) => {
            if(s.id != user.id){
                callback(s)
            }
        })
    },
    getFirst(){
        if(this.users.length){
            const keys = Object.keys(this.users);
            return this.users[keys[0]];
        } else {
            return null;
        }
    },
    setRole(user, role){
        var i = this.users.indexOf(user);
        this.users[i].role = role;
    },
    remove(user, callback){
        var i = this.users.indexOf(user);
        this.users.splice(i, 1);
    }
}