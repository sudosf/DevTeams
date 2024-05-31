const getUserDisplayName = async (tx, userId) => {
	const q = `SELECT DisplayName FROM TeamMembershipTypes
                    WHERE UserId = @UserId`;

	const request = tx.request();
	const ret = await request.input('UserId', userId).query(q);

	return ret.recordset[0].TeamMembershipTypeId;
};

const createChat = async (tx, creatorUserId, otherUserId) => {
	const creatorUserName = await getUserDisplayName(
		tx,
		creatorUserId,
	);
	const otherUserName = await getUserDisplayName(
		tx,
		otherUserId,
	);
	const q = `
		INSERT INTO Chats(ChatName)
			VALUES(@ChatName);

		DECLARE @ChatId INT = SCOPE_IDENTITY();

		INSERT INTO UserChats(UserId, ChatId)
			VALUES (@CreatorUserId, @ChatId), (@OtherUserId, @ChatId);
			
		SELECT @ChatId as chatId;
	`;

	const request = tx.request();
	const ret = await request
		.input('ChatName', `${creatorUserName}, ${otherUserName}`)
		.input('CreatorUserId', creatorUserId)
		.input('OtherUserId', otherUserId)
		.query(q);

	return ret.recordset[0].chatId;
};

const getChats = async (tx, userId) => {
	const q = `
		SELECT cht.ChatName AS chatName, msg.LastSavedAt AS lastMessageAt FROM Chats as cht
		INNER JOIN (
			SELECT ChatId FROM TeamChats as tc
			INNER JOIN (
				SELECT UserId, TeamId 
				FROM TeamMemberships
				WHERE UserId = @UserId
			) AS tm ON tm.TeamId = tc.TeamId
			UNION
			SELECT ChatId 
			FROM UserChats as uc
			WHERE UserId = @UserId
		) AS cids ON cids.ChatId = cht.ChatId
		LEFT JOIN (
			SELECT ChatId, MAX(SavedAt) as LastSavedAt
			FROM Messages
			GROUP BY ChatId
		) AS msg ON msg.ChatId = cht.ChatId
		ORDER BY msg.LastSavedAt DESC;
	`;

	const request = tx.request();
	const ret = await request
		.input('UserId', userId)
		.query(q);

	return ret.recordset;
};

const getUsers = async (tx, userId, searchStr) => {
	const q = `
		SELECT DisplayName as displayName FROM Users
		WHERE DisplayName LIKE '%'+@SearchStr+'%'
		AND UserId <> @UserId
		ORDER BY DisplayName;
	`;

	const request = tx.request();
	const ret = await request
		.input('UserId', userId)
		.input('SearchStr', searchStr)
		.query(q);

	return ret.recordset;
};

const getTeams = async (tx, userId, searchStr) => {
	const q = `
		SELECT TeamName as teamName FROM Teams AS t
		INNER JOIN (
			SELECT TeamId FROM TeamMemberships
			WHERE UserId = @UserId
		) AS tm ON tm.TeamId = t.TeamId
		WHERE TeamName LIKE '%'+@SearchStr+'%'
		ORDER BY TeamName;
	`;

	const request = tx.request();
	const ret = await request
		.input('UserId', userId)
		.input('SearchStr', searchStr)
		.query(q);

	return ret.recordset;
};

const getSearch = async (tx, userId, searchStr) => {
	const users = await getUsers(
		tx,
		userId, 
		searchStr,
	);

	const teams = await getTeams(
		tx,
		userId, 
		searchStr,
	);

	return [users, teams];
};

module.exports = {
	createChat,
	getChats,
	getSearch
};