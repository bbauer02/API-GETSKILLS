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
        Test.hasMany(models.Test, {foreignKey:'parent_id', as: 'children'})
        Test.hasMany(models.testHasLevel,{foreignKey:'test_id', targetKey:'test_id'})
        Test.belongsToMany(models.Exam,  {through:models.testHasExam,foreignKey:'test_id', otherKey:'exam_id',timestamps: false });
    }

        return Test; 
} 