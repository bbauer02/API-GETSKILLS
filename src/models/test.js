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
        }
    },
    {
        tableName: 'tests',
        timestamps: false,
    });

    Test.associate = models => {
        Test.hasOne(models.Test, { foreignKey:'parent_id',targetKey: 'test_id'});
        Test.belongsTo(models.Test, {foreignKey:'parent_id'});

        Test.hasOne(models.Session, {foreignKey:'test_id',targetKey: 'test_id'});
        Test.hasMany(models.Level,{foreignKey:'test_id',targetKey: 'test_id'});
        Test.hasMany(models.Exam,{foreignKey:'test_id',targetKey: 'test_id'})
    }
        return Test; 
} 