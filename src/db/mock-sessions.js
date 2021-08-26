﻿const sessions = [
    {
        session_id:1,
        institut_id: 1,
        start: new Date(2021, 9, 1, 9,00),
        end: new Date(2021, 9, 5, 17,00),
        limitDateSubscribe : new Date(2021, 7, 31, 23,59),
        placeAvailable: 100,
        validation: false,
        test_id:4,
    },
    {
        session_id:2,
        institut_id: 2,
        start: new Date(2021, 5, 1, 9,00),
        end: new Date(2021, 5, 5, 17,00),
        limitDateSubscribe : new Date(2021, 4, 31, 23,59),
        placeAvailable: 3,
        validation: true,
        test_id:3,
        level_id:8
    },
    {
        session_id:3,
        institut_id: 1,
        start: new Date(2021, 5, 1, 9,00),
        end: new Date(2021, 5, 5, 17,00),
        limitDateSubscribe : new Date(2021, 4, 31, 23,59),
        placeAvailable: 1,
        validation: false,
        test_id:3,
        level_id:8
    }
];

module.exports = sessions;