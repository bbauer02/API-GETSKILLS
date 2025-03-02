const { models } = require("./index");

module.exports = (sequelize, DataTypes) => {
  const sessionHasExam = sequelize.define('sessionHasExam', {
    sessionHasExam_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    adressExam: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: { msg: `sessionHasExam : adressExam cannot be empty !` }
      }
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: { msg: `sessionHasExam : room cannot be empty !` }
      }
    },
    DateTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject_id: {  // 🔥 AJOUT DU CHAMP subject_id
      type: DataTypes.INTEGER,
      allowNull: true,  // Peut être null au début, puis défini plus tard
      references: {
        model: "subjects",
        key: "subject_id"
      }
    }
  }, {
    tableName: 'session_has_exam',
    timestamps: false,
    uniqueKeys: {
      compositeKey: { fields: ['session_id', 'exam_id'] }
    }
  });

  sessionHasExam.associate = models => {
    sessionHasExam.belongsTo(models.Session, { foreignKey: 'session_id', sourceKey: 'session_id', onDelete: 'CASCADE' });
    sessionHasExam.belongsTo(models.Exam, { foreignKey: 'exam_id', sourceKey: 'exam_id' });
    sessionHasExam.belongsTo(models.Subject, { foreignKey: 'subject_id', sourceKey: 'subject_id', as: 'subject' }); // 🔥 ASSOCIATION AVEC SUBJECT
    sessionHasExam.hasMany(models.sessionExamHasExaminator, { foreignKey: 'sessionHasExam_id', sourceKey: 'sessionHasExam_id' });
  };

  return sessionHasExam;
};
