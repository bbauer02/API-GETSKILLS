const sequelize = require('./src/db/sequelize');
const { QueryTypes } = require('sequelize');
var CronJob = require('cron').CronJob;

// Cron executer tout les mois
const job = new CronJob('0 0 1 * *', async function () {
    console.log("\n\nCRON TIME!\n\n")

    // delete les archives UserHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM User_hist WHERE createdAt <=DATE_SUB(NOW(), INTERVAL 6 MONTH)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }



    // delete les archives users qui ont plus de 6 mois
    /*
    await sequelize.query("DELETE * FROM 'UserHist' WHERE created_at<=DATE_SUB(NOW(), INTERVAL 6 MONTH",
    {
        type: QueryTypes.DELETE
    });
    */

    // delete les archives SessionUserOptionHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM Session_user_option_hist WHERE createdAt<=DATE_SUB(NOW(), INTERVAL 10 YEAR)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }


    // delete les archives ExamPricesHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM prices_exams_hist WHERE createdAt<=DATE_SUB(NOW(), INTERVAL 10 YEAR)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }


    // delete les archives SessionHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM Session_hist WHERE createdAt<=DATE_SUB(NOW(), INTERVAL 10 YEAR)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }



    // delete les archives sessionUserHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM session_user_hist WHERE createdAt<=DATE_SUB(NOW(), INTERVAL 10 YEAR)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }


    // delete les archives SkillsHist qui ont plus de 10 ans
    try {
        await sequelize.query("DELETE FROM Skills_hist WHERE createdAt<=DATE_SUB(NOW(), INTERVAL 10 YEAR)",
            {
                type: QueryTypes.DELETE
            });
    } catch (error) {
        console.log(error.message);
    }
    ;
});


job.start();
