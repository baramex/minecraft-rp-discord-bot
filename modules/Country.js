const { PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const client = require("../client");
const { countries } = require("./database");

class Country {
    constructor({ id, name, flag, members, categoryId = "", roleId = "", channels = [] }) {
        this.id = id;
        this.name = name;
        this.flag = flag;
        this.members = members;

        this.categoryId = categoryId;
        this.roleId = roleId;
        this.channels = channels;
    }

    addMember(memberId, capacity) {
        if (!memberId) throw new Error("Missing member id");
        if (!capacity) throw new Error("Missing capacity");

        if (this.members.find(m => m.id === memberId)) throw new Error("Member is already in country");
        this.members.push({ id: memberId, capacity });

        return this.save();
    }

    removeMember(memberId) {
        if (!memberId) throw new Error("Missing member id");

        this.members = this.members.filter(m => m.id !== memberId);
        const roleId = this.roleId;
        const member = client.guild.members.cache.get(memberId);
        if (member) member.roles.remove(roleId);

        return this.save();
    }

    editMember(memberId, capacity) {
        if (!memberId) throw new Error("Missing member id");
        if (!capacity) throw new Error("Missing capacity");

        const member = this.members.find(m => m.id === memberId);
        if (!member) throw new Error("Member not found");

        member.capacity = capacity;

        return this.save();
    }

    async save(update = true) {
        const country = countries.get("countries").find({ id: this.id });

        if (country.value()) country.assign(this).write();
        else countries.get("countries").push(this).write();

        if (update) await this.update();

        return this;
    }

    async update() {
        let categoryId = this.categoryId;
        let roleId = this.roleId;

        if (!roleId) {
            const role = await client.guild.roles.create({
                name: this.flag + " " + this.name,
                hoist: true,
                color: "Random",
                position: 4
            });

            this.roleId = role.id;
            roleId = role.id;
        }
        else {
            const role = client.guild.roles.cache.get(roleId);
            if (role) {
                if (role.name !== this.flag + " " + this.name) {
                    await role.edit({
                        name: this.flag + " " + this.name
                    });
                }
            }
        }
        if (!categoryId) {
            const category = await client.guild.channels.create({
                name: this.flag + " " + this.name,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: client.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                    }
                ]
            });

            this.categoryId = category.id;
            categoryId = category.id;
        }
        else {
            const category = client.guild.channels.cache.get(categoryId);
            if (category) {
                if (category.name !== this.flag + " " + this.name) {
                    await category.edit({
                        name: this.flag + " " + this.name
                    });
                }
            }
        }

        const channels = this.channels;

        for (const c of channels) {
            const channel = client.guild.channels.cache.get(c.id);
            if (!channel) channels.splice(channels.indexOf(c), 1);
        }

        if (!channels.find(c => c.name === "rejoindre")) {
            const channel = await client.guild.channels.create({
                name: "rejoindre",
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                    }
                ]
            });

            channels.push({ id: channel.id, name: channel.name });
        }
        if (!channels.find(c => c.name === "membres")) {
            const channel = await client.guild.channels.create({
                name: "membres",
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: client.guild.id,
                        deny: [PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: roleId,
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            channels.push({ id: channel.id, name: channel.name });
        }
        if (!channels.find(c => c.name === "général")) {
            const channel = await client.guild.channels.create({
                name: "général",
                type: ChannelType.GuildText,
                parent: categoryId
            });

            channels.push({ id: channel.id, name: channel.name });
        }
        if (!channels.find(c => c.name === "vocal")) {
            const channel = await client.guild.channels.create({
                name: "vocal",
                type: ChannelType.GuildVoice,
                parent: categoryId
            });

            channels.push({ id: channel.id, name: channel.name });
        }

        for (const m of this.members) {
            const member = client.guild.members.cache.get(m.id);
            if (member && !member.roles.cache.has(roleId)) await member.roles.add(client.guild.roles.cache.get(roleId));
            else if (!member) this.members = this.members.filter(m => m.id !== m.id);
        }

        const membersId = channels.find(c => c.name === "membres").id;
        const channel = client.guild.channels.cache.get(membersId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor(client.guild.roles.cache.get(roleId).color)
                .setTitle("Membres de " + this.flag + " " + this.name)
                .setDescription(this.members.map(m => `- <@${m.id}> (${m.capacity})`).join("\n") || "Aucun membre.");

            const message = await channel.messages.fetch({ limit: 1 });
            if (message.size > 0) await message.first().edit({ embeds: [embed] });
            else await channel.send({ embeds: [embed] });
        }

        return this.save(false);
    }

    async remove() {
        const roleId = this.roleId;
        const categoryId = this.categoryId;
        if (roleId) await client.guild.roles.cache.get(roleId)?.delete();
        if (categoryId) await client.guild.channels.cache.get(categoryId)?.delete();
        for (const c of this.channels) {
            await client.guild.channels.cache.get(c.id)?.delete();
        }

        countries.get("countries").remove({ id: this.id }).write();
    }

    static load(id) {
        if (!id) throw new Error("Missing country id");

        const country = countries.get("countries").find({ id }).value();
        if (!country) throw new Error("Country not found");

        return new Country(country);
    }

    static create(name, flag) {
        if (!name) throw new Error("Missing country name");
        if (!flag) throw new Error("Missing country flag");

        const id = (countries.get("countries").takeRight(1).value()[0]?.id || 0) + 1;

        const country = new Country({ id, name, flag, members: [] });

        return country.save();
    }

    static getByMember(memberId) {
        if (!memberId) throw new Error("Missing member id");

        const country = countries.get("countries").find({ members: [{ id: memberId }] }).value();
        if (!country) throw new Error("Country not found");

        return new Country(country);
    }

    static getByName(name) {
        if (!name) throw new Error("Missing country name");

        const country = countries.get("countries").find({ name }).value();
        if (!country) throw new Error("Country not found");

        return new Country(country);
    }

    static getAll() {
        const c = countries.get("countries").value();
        if (!c) throw new Error("Countries not found");

        return c.map(c1 => new Country(c1));
    }
}

module.exports = Country;