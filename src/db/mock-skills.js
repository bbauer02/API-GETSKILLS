const skills = [
    {
        id:1,
        label: "COMPETENCE 1",
        parent_id: null,
        isArchive: false,
    },
    {
        id:2,
        label: "COMPETENCE 1 1",
        parent_id: 1,
        isArchive: false,
    },
    {
        id:3,
        label: "COMPETENCE 1 1 1",
        parent_id: 2,
        isArchive: false,
    },
    {
        id:4,
        label: "COMPETENCE 2",
        parent_id: null,
        isArchive: false,
    },
    {
        id:5,
        label: "COMPETENCE 2 1",
        parent_id: 4,
        isArchive: false,
    },
    {
        id:6,
        label: "COMPETENCE 3",
        parent_id: null,
        isArchive: false,
    }
]


module.exports = skills;