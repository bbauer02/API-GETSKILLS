module.exports = (sequelize, DataTypes) => {
    const Test =  sequelize.define('Test', {
        test_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Test:label cannot be empty!`},
                notNull: {msg: `Test:label cannot be NULL!`}
            }
        },
        isInternal: {
            type:DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Test:isInternal cannot be empty!`},
                notNull: {msg: `Test:isInternal cannot be NULL!`}
            }
        },
        parent_id : {
            type:DataTypes.INTEGER,
            defaultValue:null,
            allowNull:true
        },
        isArchive : {
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Test:isArchive cannot be empty!`},
                notNull: {msg: `Test:isArchive cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'tests',
        timestamps: false,
    });

    Test.associate = models => {
        Test.hasMany(models.Test, { as: "child",foreignKey:'parent_id',sourceKey: 'test_id'});
        Test.belongsTo(models.Test, {as:"parent",foreignKey:'parent_id'});

        Test.hasMany(models.Session, {foreignKey:'test_id',sourceKey: 'test_id'});
        Test.hasMany(models.Level,{foreignKey:'test_id',sourceKey: 'test_id'});

        Test.hasMany(models.Exam,{foreignKey:'test_id',sourceKey: 'test_id'})
        Test.hasMany(models.empowermentTests,{foreignKey:'test_id', sourceKey:'test_id'});

    }
        return Test;  
}   