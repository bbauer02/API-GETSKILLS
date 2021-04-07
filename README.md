# API : GET-TESTED.ONLINE

*GET-TESTED.ONLINE* est le nom provisoire du nouveau projet de la société **Get-skills.online**.
Il s'agit d'une application gestion de tests et certifications en ligne. 
Ce fichier décrit le fonctionnement de l'API pour les développeurs FRONT-END qui auront à travailler sur le projet. 
Le développeur de cette API est : [Baptiste Bauer](mailto:bbauer02@gmail.com).
La base de données a été conçu par : [Olivier Leroy](mailto:o.leroy@yahoo.fr) et [Baptiste Bauer](mailto:bbauer02@gmail.com)

# #Table : levels
| nom du champ| description|
|--|--|
| *id* | identifiant d'un niveau|
| *label* | Intitulé du niveau. Il doit être unique et non NULL|
| *ref*| Référence du niveau. NULL s'il n'est pas renseigné|
| *description*| Description du niveau. NULL s'il n'est pas renseigné|


##  Ajouter un niveau

|METHODE|URL|
|--|--|
|  **POST** | */api/levels* |

Format du fichier **JSON** à envoyer :

     {
         "label" : "Libélé du niveau",
    	 "ref"  : "REFERENCE 123",
    	 "description" : "Description du nouveau niveau"
     }

##  Modifier un niveau

|METHODE|URL|Paramètre |
|--|--|--|
|  **PUT** | */api/levels/< id >* |***< id >*** est un *entier* |
***< id >*** est l'identifiant du niveau à modifier.

Exemple de **JSON** à envoyer : 

     {
        "id" : "1",
    	"label" : "A1",
    	"ref": "REF-123",
        "description": "Ceci est un fichier JSON de démonstration"
     }

##  Supprimer un niveau

|METHODE|URL|Paramètre |
|--|--|--|
|  **DEL** | */api/levels/< id >* |***< id >*** est un *entier* |
***< id >*** est l'identifiant du niveau à supprimer.

##  Lister les niveaux
|METHODE|URL|
|--|--|
|  **GET** | */api/levels* |

Retourne au format JSON la liste de tous les niveaux.

##  Récupérer un niveaux précis
|METHODE|URL| Paramètre |
|--|--|--|
|  **GET** | */api/levels/< id >** | ***< id >*** est un *entier* |

***< id >*** est l'identifiant du niveau à supprimer.
Retourne au format JSON un niveau en fonction de son identifiant. 


# #Table : tests

