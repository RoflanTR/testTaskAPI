"use strict";
const fs = require("fs");
const axios = require("axios");
const { Client } = require("pg");

// Конфигурация подключения к базе данных
const config = {
    connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(process.env.USERPROFILE + "/.postgresql/root.crt").toString(),
    },
};

const client = new Client(config);

// Функция для создания таблицы и вставки данных
async function createTableAndInsertData() {
    try {
        await client.connect();

        // Создание таблицы
        await client.query(`
            CREATE TABLE IF NOT EXISTS characters (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                data JSONB NOT NULL
            );
        `);
        console.log("Table created successfully.");

        // Получение данных с API Rick and Morty
        const response = await axios.get('https://rickandmortyapi.com/api/character');
        const characters = response.data.results;

        // Вставка данных
        const insertQuery = `
            INSERT INTO characters (name, data)
            VALUES ($1, $2)
            RETURNING *;
        `;

        for (let character of characters) {
            const values = [character.name, character];
            const res = await client.query(insertQuery, values);
            console.log("Inserted row:", res.rows[0]);
        }

    } catch (err) {
        console.error("Error executing query", err.stack);
    } finally {
        await client.end();
    }
}

// Запуск функции
createTableAndInsertData();
