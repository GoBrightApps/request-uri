// eslint-disable-next-line no-undef
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src", "<rootDir>/tests"],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
