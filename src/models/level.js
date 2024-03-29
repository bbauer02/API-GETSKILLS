﻿module.exports = (sequelize, DataTypes) => {
    const Level =  sequelize.define('Level', {
        level_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Level:Label cannot be empty!`},
                notNull: {msg: `Level:Label cannot be NULL!`}
            }
        },
        ref: {
            type:DataTypes.STRING,
            allowNull:true
        },
        description :{
            type:DataTypes.TEXT,
            allowNull:true
        },
        isArchive : {
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Level:isArchive cannot be empty!`},
                notNull: {msg: `Level:isArchive cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'levels',
        timestamps: false,
    });

    Level.associate = models => {
        Level.hasMany(models.Session, {foreignKey:'level_id',sourceKey: 'level_id'});
        Level.belongsTo(models.Test,{foreignKey:'test_id',sourceKey: 'test_id'})
        Level.hasMany(models.Exam, {foreignKey:'level_id',sourceKey: 'level_id',onDelete:'SET NULL'});
    }
  
    return Level;
}