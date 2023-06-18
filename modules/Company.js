const { PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const client = require("../client");
const { companies } = require("./database");

class Company {
    constructor({ id, name, logo, members, categoryId = "", roleId = "", channels = [] }) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.members = members;

        this.categoryId = categoryId;
        this.roleId = roleId;
        this.channels = channels;
    }

    addMember(memberId, capacity, share = undefined) {
        if (!memberId) throw new Error("Missing member id");
        if (!capacity) throw new Error("Missing capacity");

        if (this.members.find(m => m.id === memberId)) throw new Error("Member is already in the company");
        if (!share) share = 100 / (this.members.length || 1);
        if (!this.members.length) share = 100;

        this.members.forEach(m => {
            m.share -= share / this.members.length;
        });
        this.members.push({ id: memberId, capacity, share })
        console.log(this.members, share);

        return this.save();
    }

    removeMember(memberId) {
        if (!memberId) throw new Error("Missing member id");

        const mem = this.members.find(m => m.id === memberId);
        if (!mem) throw new Error("Member not found");

        this.members = this.members.filter(m => m.id !== memberId);
        const roleId = this.roleId;
        const member = client.guild.members.cache.get(memberId);
        if (member) member.roles.remove(roleId);

        this.members.forEach(m => {
            m.share += mem.share / this.members.length;
        });
        console.log(this.members, mem.share);

        return this.save();
    }

    editMember(memberId, capacity, share) {
        if (!memberId) throw new Error("Missing member id");
        if (!capacity) throw new Error("Missing capacity");

        const member = this.members.find(m => m.id === memberId);
        if (!member) throw new Error("Member not found");

        member.capacity = capacity;
        member.share = share;

        const mshare = (member.share - share) / (this.members.length - 1);
        this.members.forEach(m => {
            if (m.id !== memberId) m.share += mshare;
        });
        console.log(this.members, mshare);

        return this.save();
    }

    async save(update = true) {
        const company = companies.get("companies").find({ id: this.id });

        if (company.value()) company.assign(this).write();
        else companies.get("companies").push(this).write();

        if (update) await this.update();

        return this;
    }

    get fullname() {
        return this.logo + " Entrepise - " + this.name;
    }

    async update() {
        let categoryId = this.categoryId;
        let roleId = this.roleId;

        if (!roleId) {
            const role = await client.guild.roles.create({
                name: this.fullname,
                hoist: true,
                color: "Random",
                position: 3
            });

            this.roleId = role.id;
            roleId = role.id;
        }
        else {
            const role = client.guild.roles.cache.get(roleId);
            if (role) {
                if (role.name !== this.fullname) {
                    await role.edit({
                        name: this.fullname
                    });
                }
            }
        }
        if (!categoryId) {
            const category = await client.guild.channels.create({
                name: this.fullname,
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
                if (category.name !== this.fullname) {
                    await category.edit({
                        name: this.fullname
                    });
                }
            }
        }

        const channels = this.channels;

        for (const c of channels) {
            const channel = client.guild.channels.cache.get(c.id);
            if (!channel) channels.splice(channels.indexOf(c), 1);
        }

        if (!channels.find(c => c.name === "présentation")) {
            const channel = await client.guild.channels.create({
                name: "présentation",
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: client.guild.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            channels.push({ id: channel.id, name: channel.name });
        }
        if (!channels.find(c => c.name === "sous-entreprises")) {
            const channel = await client.guild.channels.create({
                name: "sous-entreprises",
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: client.guild.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
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
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: roleId,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel]
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
        if (!channels.find(c => c.name === "contact")) {
            const channel = await client.guild.channels.create({
                name: "contact",
                type: ChannelType.GuildForum,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: client.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        deny: [PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: roleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
                    }
                ]
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
                .setTitle("Membres de " + this.fullname)
                .setDescription(this.members.map(m => `- <@${m.id}> (${m.capacity}: ${m.share.toFixed(1)}%)`).join("\n") || "Aucun membre.");

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

        companies.get("companies").remove({ id: this.id }).write();
    }

    static load(id) {
        if (!id) throw new Error("Missing company id");

        const company = companies.get("companies").find({ id }).value();
        if (!company) throw new Error("Company not found");

        return new Company(company);
    }

    static create(name, logo) {
        if (!name) throw new Error("Missing company name");
        if (!logo) throw new Error("Missing company logo");

        const id = (companies.get("companies").takeRight(1).value()[0]?.id || 0) + 1;

        const company = new Company({ id, name, logo, members: [] });

        return company.save();
    }

    static getByMember(memberId) {
        if (!memberId) throw new Error("Missing member id");

        const comp = companies.get("companies").filter({ members: [{ id: memberId }] }).value();
        if (!comp) throw new Error("Company not found");

        return comp.map(a => new Company(a));
    }

    static getByName(name) {
        if (!name) throw new Error("Missing company name");

        const company = companies.get("companies").find({ name }).value();
        if (!company) throw new Error("Company not found");

        return new Company(company);
    }

    static getAll() {
        const c = companies.get("companies").value();
        if (!c) throw new Error("companies not found");

        return c.map(c1 => new Company(c1));
    }
}

module.exports = Company;