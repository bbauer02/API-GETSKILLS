const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const sessionUserOption =  sequelize.define('sessionUserOption', {
        option_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_price: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tva: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        addressExam: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isCandidate: {
            type: DataTypes.BOOLEAN
        },
        DateTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        sessionUser_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: 'session_user_option', 
        timestamps: false,
        hooks: {
            beforeDestroy (instance, options) {
                // console.log(instance.dataValues);
                models['sessionUserOptionHist'].create(instance.dataValues);
            }
        }
    });
    sessionUserOption.associate = models => { 
        sessionUserOption.belongsTo(models.sessionUser, { foreignKey: 'sessionUser_id', sourceKey: 'sessionUser_id', onDelete: 'CASCADE' });
        sessionUserOption.belongsTo(models.Exam,{foreignKey:'exam_id'});
    };
    
    return sessionUserOption;
}
 