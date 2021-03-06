import {BotCommand} from "./BotCommand";
import {Guild, Message, Snowflake} from "discord.js";
import {OWAPI} from "../util/owapi/owapi";
import {ResponseEmbed} from "../util/ResponseEmbed";
import {StatusCodeError} from "request-promise-native/errors";
import {UserData} from "../models/UserData";
import {client} from "../app";

export class UpdateCommand extends BotCommand {
	commandName: string = "!update";
	maxArguments: number;
	minArguments: number;

	guild: Guild;

	guildRoles: {
		bronzeRole: string,
		silverRole: string,
		goldRole: string,
		platinumRole: string,
		diamondRole: string,
		masterRole: string,
		grandMasterRole: string,
		notPlacedRole: string
	};

	constructor(guild: Guild) {
		super();
		this.guild = guild;
		this.guildRoles = {
			bronzeRole: guild.roles.find("name", "Bronze").id,
			silverRole: guild.roles.find("name", "Silver").id,
			goldRole: guild.roles.find("name", "Gold").id,
			platinumRole: guild.roles.find("name", "Platinum").id,
			diamondRole: guild.roles.find("name", "Diamond").id,
			masterRole: guild.roles.find("name", "Master").id,
			grandMasterRole: guild.roles.find("name", "Grandmaster").id,
			notPlacedRole: guild.roles.find("name", "Not placed").id
		};
	}

	handle(msg: Message) {
		let response = new ResponseEmbed();
		let sentMessage = null;
		response.setDescription("Your request is being processed");
		response.setColor("#0000FF");
		let promises = [];
		promises.push(msg.channel.send(response).then((message: Message) => {
			sentMessage = message;
		}));

		let args: string[] = msg.content.split(" ");
		args.splice(0, 1);

		if (args.length !== 1) {
			console.log("!update command without arguments");
			UserData.findOne({userID: msg.author.id}, (err, doc) => {
				if (err) {
					console.log(err);
					response.setDescription("Unexpected error");
					response.complete(false);
					Promise.all(promises).then(() => {
						sentMessage.edit(response);
					});
					return;
				} else if (doc === null) {
					response.setDescription("You are not registered, please execute `!register <battletag>` first");
					response.complete(false);

					Promise.all(promises).then(() => {
						sentMessage.edit(response);
					});
					return;
				} else {
					const username = doc.battletag;

					promises.push(this.constructResponse(msg, username).then((res) => {
						response = res;
					}));

					Promise.all(promises).then(() => {
						sentMessage.edit(response);
					});
				}
			});
			return;
		} else {
			response.setDescription("You may not execute this command with more than 0 arguments");
			response.complete(false);

			Promise.all(promises).then(() => {
				sentMessage.edit(response);
			});
		}
	}

	private constructResponse(msg: Message, username: String): Promise<ResponseEmbed> {
		let result = new Promise<ResponseEmbed>((resolve, reject) => {
			username = username.replace("#", "-");
			let response = new ResponseEmbed();
			let promises = [];

			promises.push(OWAPI.requestStats(username).then((json) => {
				let role: Snowflake = null;
				let tier = json.eu.stats.competitive.overall_stats.tier;
				switch (tier) {
					case null:
						role = this.guildRoles.notPlacedRole;
						break;
					case "bronze":
						role = this.guildRoles.bronzeRole;
						break;
					case "silver":
						role = this.guildRoles.silverRole;
						break;
					case "gold":
						role = this.guildRoles.goldRole;
						break;
					case "platinum":
						role = this.guildRoles.platinumRole;
						break;
					case "diamond":
						role = this.guildRoles.diamondRole;
						break;
					case "master":
						role = this.guildRoles.masterRole;
						break;
					case "grandmaster":
						role = this.guildRoles.grandMasterRole;
						break;
				}
				let author = msg.guild.members.find("id", msg.author.id);
				promises.push(author.removeRole(this.guildRoles.bronzeRole));
				promises.push(author.removeRole(this.guildRoles.silverRole));
				promises.push(author.removeRole(this.guildRoles.goldRole));
				promises.push(author.removeRole(this.guildRoles.platinumRole));
				promises.push(author.removeRole(this.guildRoles.diamondRole));
				promises.push(author.removeRole(this.guildRoles.masterRole));
				promises.push(author.removeRole(this.guildRoles.grandMasterRole));
				promises.push(author.removeRole(this.guildRoles.notPlacedRole));
				Promise.all(promises).then(() => {
					msg.guild.members.find("id", msg.author.id).addRole(role).then(() => {
						if (tier === null) {
							response.setDescription(`Set your colour to **Not placed**`);
						} else {
							response.setDescription(`Set your colour to **${tier.charAt(0).toUpperCase()}${tier.substring(1, tier.length)}**`);
						}
						response.complete(true);
						resolve(response);
					});
				});
			}).catch((err: StatusCodeError) => {
				let body = JSON.parse(err.error);
				if (body.msg === "profile not found") {
					response.setDescription("This user was not found");
				} else {
					response.setDescription("Unexpected error handling your request");
				}
				response.complete(false);
				resolve(response)
			}));
		});

		return result;
	}

	public updateUser(battletag: String, discordID: String) {
		let promises = [];

		console.log(`Updating ${discordID}`);

		battletag = battletag.replace("#", "-");

		OWAPI.requestStats(battletag).then((json) => {
			let role: Snowflake = null;
			let tier = json.eu.stats.competitive.overall_stats.tier;
			switch (tier) {
				case null:
					role = this.guildRoles.notPlacedRole;
					break;
				case "bronze":
					role = this.guildRoles.bronzeRole;
					break;
				case "silver":
					role = this.guildRoles.silverRole;
					break;
				case "gold":
					role = this.guildRoles.goldRole;
					break;
				case "platinum":
					role = this.guildRoles.platinumRole;
					break;
				case "diamond":
					role = this.guildRoles.diamondRole;
					break;
				case "master":
					role = this.guildRoles.masterRole;
					break;
				case "grandmaster":
					role = this.guildRoles.grandMasterRole;
					break;
			}
			let author = this.guild.members.find("id", discordID);
			promises.push(author.removeRole(this.guildRoles.bronzeRole));
			promises.push(author.removeRole(this.guildRoles.silverRole));
			promises.push(author.removeRole(this.guildRoles.goldRole));
			promises.push(author.removeRole(this.guildRoles.platinumRole));
			promises.push(author.removeRole(this.guildRoles.diamondRole));
			promises.push(author.removeRole(this.guildRoles.masterRole));
			promises.push(author.removeRole(this.guildRoles.grandMasterRole));
			promises.push(author.removeRole(this.guildRoles.notPlacedRole));
			Promise.all(promises).then(() => {
				author.addRole(role);
				console.log(`Updated '${author.displayName}' for account '${battletag}'`)
			});
		});
	}

}