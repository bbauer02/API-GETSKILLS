module.exports = (sequelize, DataTypes) => {
    const User =  sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_id: {
            type: DataTypes.INTEGER
        },
        login: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        firstname : {
            type: DataTypes.STRING,
        },
        lastname : {
            type: DataTypes.STRING,
        },
        adress1 : {
            type: DataTypes.STRING,
        },
        adress2 : {
            type: DataTypes.STRING,
        },
        zipcode : {
            type: DataTypes.STRING,
        },
        city : {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.INTEGER
        },
        birthday: {
            type: DataTypes.DATE
        },
        nationnality: {
            type: DataTypes.INTEGER
        },
        firstlanguage: {
            type: DataTypes.INTEGER
        }
    });
    return User;
} 