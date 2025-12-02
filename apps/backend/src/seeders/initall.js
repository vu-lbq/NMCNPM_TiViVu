"use strict";

const { randomUUID } = require("crypto");

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
	async up(queryInterface) {
		const t = await queryInterface.sequelize.transaction();
		try {
			const now = new Date();

			// 1) Users
			const userIds = [];
			const users = [];
			const bcrypt = require('bcryptjs');
			const domain = 'gmail.com';
			for (let i = 1; i <= 5; i++) {
				const id = randomUUID();
				userIds.push(id);
				users.push({
					id,
					// Store email in username field (backend treats username as email)
					username: `user${i}@${domain}`,
					passwordHash: bcrypt.hashSync(`pass${i}`, 10),
					displayName: `User ${i}`,
					createdAt: now,
					updatedAt: now,
				});
			}
			await queryInterface.bulkInsert("users", users, { transaction: t });

			// 2) Conversations (10 per user)
			const conversations = [];
			const convoIdsPerUser = new Map();
			for (const uid of userIds) {
				const convosForUser = [];
				for (let c = 1; c <= 10; c++) {
					const cid = randomUUID();
					convosForUser.push(cid);
					conversations.push({
						id: cid,
						title: `Conversation ${c} of ${uid.slice(0, 8)}`,
						status: "active",
						userId: uid,
						createdAt: now,
						updatedAt: now,
					});
				}
				convoIdsPerUser.set(uid, convosForUser);
			}
			await queryInterface.bulkInsert("conversations", conversations, { transaction: t });

			// 3) Messages (10 per user, distributed randomly among their conversations)
			const samplePrompts = [
				"Hello!",
				"Can you explain polymorphism simply?",
				"What's the weather like today?",
				"Summarize this topic for me.",
				"Give me tips to learn faster.",
			];
			const sampleReplies = [
				"Sure, here's a concise explanation.",
				"This depends on your location, but generally...",
				"Here are a few tips you can try.",
				"Summary: the key points are...",
				"Absolutely! Let's break it down step by step.",
			];

			const messages = [];
			for (const uid of userIds) {
				const convos = convoIdsPerUser.get(uid) || [];
				for (let m = 1; m <= 10; m++) {
					const convoId = pick(convos);
					const isUserTurn = m % 2 === 1;
					messages.push({
						id: randomUUID(),
						role: isUserTurn ? "user" : "assistant",
						content: isUserTurn ? pick(samplePrompts) : pick(sampleReplies),
						conversationId: convoId,
						userId: uid,
						createdAt: now,
						updatedAt: now,
					});
				}
			}
			await queryInterface.bulkInsert("messages", messages, { transaction: t });

			await t.commit();
		} catch (err) {
			await t.rollback();
			throw err;
		}
	},

	async down(queryInterface) {
		const t = await queryInterface.sequelize.transaction();
		try {
			await queryInterface.bulkDelete("messages", null, { transaction: t });
			await queryInterface.bulkDelete("conversations", null, { transaction: t });
			await queryInterface.bulkDelete("users", null, { transaction: t });
			await t.commit();
		} catch (err) {
			await t.rollback();
			throw err;
		}
	},
};
