FORMAT: 1A
HOST: https://polls.apiblueprint.org/

# API pre obslužný systém

Tento dokument popisuje REST API servera pre simuláciu obslužného systému.
Pre účely simulácie bola ako služba ktorú poskytuje obslužný systém zvolené
získanie záznamov z databázy citátov známych osobností.

### HTTP status kódy

Chyby vzniknuté v jednotlivých službách generujú odpoveď s chybovým http statusom
s popisom chyby v tele http požiadavku:

```
{
    error: "Some error..."
}
```

Ostatné chyby vzniknuté z iných dôvodov (nesprávna url, zlyhanie servera, atď...)
sú vrátene s patričným chybový http statusom a s html textom.

#### Prehľad použitých http statusov

| http status code | popis                                      |
| ---------------- | ------------------------------------------ |
| 200              | úspešné vykonanie api                      |
| 401              | neautentifikovaný užívateľ                 |
| 503              | kapacita front požiadaviek bola prekročená |


## Správa užívateľov [/api/users]

Užívatelia sa registrujú zadaním užívateľského mena. Po zaregistrovaní je vytvorená
relácia užívateľa identifikovaná parametrom `sid`, ktorý je vygenerovaný ako
[uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier) verzia 4.

Server nerieši duplicitu užívateľských mien, takže dvaja užívatelia môžu používať rovnaké
užívateľské meno.


### Autentifikácia

Po registrácii je `sid` uložené do cookies. Autentifikácia potom overuje platnosť relácie
cez cookie uložený v headeri http požiadavky.

Pre účely simulácie je možné `sid` uviesť ako uri parameter alebo ako json objekt v tele http požiadavky.
V tomto prípade sa ignoruje cookie v hlavičke.

### api

| metóda | url                 | popis                                            |
| ------ | ------------------- | ------------------------------------------------ |
| POST   | /api/users/register | Zaregistruje nového užívateľa                    |
| GET    | /api/users/current  | Získa údaje aktuálneho užívateľa                 |
| POST   | /api/users/logout   | Odhlási užívateľa zrušením užívateľskej relácie. |


#### Zaregistrovanie nového užívateľa [POST /api/users/register]

+ Attributes (object)

    + username: "Ján Novák" (string, required) - Menu užívateľa
    + simulate: true (boolean, optional) - Ak je nastavený tento parameter, tak sa robí registrácia v rámci simulácie a nebude nastavený cookie

+ Request (application/json)

        {
            username: "Ján Novák"
        }


+ Response 200 (application/json)

    + Headers

            Set-Cookie: sid=a77a3cf0-979e-4bc9-8d8b-031088c09117

    + Body

            {
                "sid": "a77a3cf0-979e-4bc9-8d8b-031088c09117",
            }

#### Získanie údajov o prihlásenom užívateľovi [GET /api/users/current]

+ Attributes (object)

    + sid: `a77a3cf0-979e-4bc9-8d8b-031088c09117` (string, optional) - Identifikácia relácie, ak nie je uvedená, tak sa použije hodnota z cookie

+ Request (application/json)

    + Headers

            Cookie: sid=a77a3cf0-979e-4bc9-8d8b-031088c09117

    + Body

            {
                "sid": "a77a3cf0-979e-4bc9-8d8b-031088c09117"
            }


+ Response 200 (application/json)

        {
            "username": "Ján Novák"
        }

+ Response 401 (application/json)

        {
            "error": "Invalid session"
        }

#### Odhlásenie užívateľa [POST /api/users/logout]

+ Attributes (object)

    + sid: `a77a3cf0-979e-4bc9-8d8b-031088c09117` (string, optional) - Identifikácia relácie, ak nie je uvedená, tak sa použije hodnota z cookie


+ Request (application/json)

    + Headers

            Cookie: sid=a77a3cf0-979e-4bc9-8d8b-031088c09117

+ Response 200 (application/json)

        {
            "message": "success"
        }


+ Response 401 (application/json)

        {
            "error": "Invalid session"
        }



## Citáty [/api/quotes{?count}]

Požiadavka na získanie záznamov databázy citátov. Jeden alebo viacero citátov za vyberie z databázy
a vráti v zozname. Pokiaľ nie je možné spracovať požiadavku (napríklad všetky fronty požiadaviek dosiahli
maximálnu kapacitu), tak je vrátený http status 503.

### api

| metóda | url               | popis            |
| ------ | ----------------- | ---------------- |
| GET    | /api/users/quotes | Získanie citátov |


#### Požiadavka na získanie citátov [GET]

+ Parameters

    + count: 2 (number, optional) - Počet citátov, ak nie je uvedené tak vráti jeden citát

+ Request (application/json)

    + Attributes

        + sid: `a77a3cf0-979e-4bc9-8d8b-031088c09117` (string, optional) - Identifikácia relácie, ak nie je uvedená, tak sa použije hodnota z cookie


    + Headers

            Cookie: sid=a77a3cf0-979e-4bc9-8d8b-031088c09117


+ Response 200 (application/json)

        {
            "quotes": [
                {
                    "quote": "A joke is a very serious thing.",
                    "author": "Winston Churchill",
                    "genre": "humor"
                                },
                {
                    "quote": "Humor is mankind's greatest blessing.",
                    "author": "Mark Twain",
                    "genre": "humor"
                }
            ],
            "serviceCenter": 1
        }


+ Response 503 (application/json)

        {
            error: "Queue capacity exceeded"
        }



## Konfigurácia servera [/api/config]


### api

| metóda | url         | popis                 |
| ------ | ----------- | --------------------- |
| GET    | /api/config | Aktuálna konfigurácia |
| POST   | /api/config | Zmena konfigurácie    |


### Získanie konfiguračných parametrov servera [GET]


+ Response 200 (application/json)

    + Attributes

        + numberOfQueues: 100 (number) - celkový počet front = (parameter **n**)
        + queueCapacity: 300 (number) - kapacita frontu požiadaviek (parameter **m**)
        + meanServiceTime: 1.21 (number) - priemerná doba obslúženia požiadavky v sekundách (parameter **t**)
        + serviceDimeDeviation: 0.12 (number) - odchýlka doby obslúženia požiadavky v sekundách (parameter **r**)


## Monitorovanie stavu servera [/api/stats]

Server monitoruje využitie front a stredísk. Vracia niekoľko porametrov z ktorých
niektoré zobrazujú aktuálnu hodnotu a iné hodnotu získanú počas behu servera.
Kumulatívne hodnoty sú zbierané počas celej prevádzky servera ale je možné ich vynulovať.

| hodnota            | typ                 | popis                                                                                                                                                                   |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activeUsers        | aktuálna hodnota    | počet aktívnych (zaregistrovaných) užívateľov                                                                                                                           |
| numberOfQueues     | aktuálna hodnota    | aktuálny počet vytvorených front                                                                                                                                        |
| queuedRequests     | aktuálna hodnota    | počet všetkých čakajúcich požiadaviek vo frontách                                                                                                                       |
| completedRequests  | kumulatívna hodnota | celkový počet splnených požiadaviek                                                                                                                                     |
| rejectedRequests   | kumulatívna hodnota | celkový počet zamietnutých požiadaviek                                                                                                                                  |
| serviceUtilization | kumulatívna hodnota | celkové využitie všetkých servisných stredísk v rozsahu hodnôt od 0 až 1 (pomer doby keď bolo servisné strediská obsadené požiavkou a celkovej doby prevádzky stredísk) |
| avgWaitingTime     | kumulatívna hodnota | priemerný čas čakania požiadaviek v rade                                                                                                                                |

Vynulovanie nastaví nulu pre tieto parametre: completedRequest, rejectedRequests, serviceUtilization a avgWaitingTime.


### api


| metóda | url        | popis                                           |
| ------ | ---------- | ----------------------------------------------- |
| GET    | /api/stats | Získanie monitorovacích údajov                  |
| POST   | /api/stats | Vynulovanie kumulatívnych monitorovacích údajov |

#### Získanie monitorovacích údajov [GET]

+ Response 200 (application/json)

    + Attributes

        + activeUsers: 100 (number) - počet aktívnych (zaregistrovaných užívateľov)
        + numberOfQueues: 10 (number) - aktuálny počet vytvorených front
        + queuedRequests: 1000 (number) - počet všetkých čakajúcich požiadaviek vo frontách
        + completedRequests: 5000 (number) - celkový počet splnených požiadaviek
        + rejectedRequests: 20 (number) - celkový počet zamietnutých požiadaviek (v prípade že sú fronty plné
        + serviceUtilization: 0.95 (number) - celkové využitie všetkých servisných stredísk v rozsahu hodnôt od 0 až 1 (pomer doby keď bolo servisné strediská obsadené požiavkou a celkovej doby prevádzky stredísk)
        + avgWaitingTime: 1.25 (number) - priemerný čas čakania požiadaviek v rade

#### Vynulovanie kumulatívnych monitorovacích údajov [DELETE]

+ Response 200 (application/json)

        {
            message: "success"
        }
