import {RichEmbed, RichEmbedOptions} from "discord.js";

export class EmbedResponse extends RichEmbed {
	private executionStart: number;
	private executionEnd: number;

	constructor(data?: RichEmbedOptions) {
		let executionStart = Date.now();
		super(data);
		this.executionStart = executionStart;
		this.setColor("#FF0000");
	}

	public complete(success: boolean): void {
		if (success)
			this.setColor("#00FF00");
		this.executionEnd = Date.now();
		this.setFooter(`This was generated by B4ST10N ${process.env.npm_package_version} | ${this.executionEnd - this.executionStart} ms`, null);
	}

}