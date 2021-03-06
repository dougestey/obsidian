const axios = require('axios');
const _ = require('lodash');

const SeatApi = axios.create({
  baseURL: process.env.SEAT_API_URL,
  timeout: 10000,
  headers: {
    'X-Token' : process.env.SEAT_API_TOKEN,
  }
});

const Seat = {

  roles: [],

  users: [],

  process(command, character, roles, msg) {
    switch (command) {
      case '!sync':
        this.getAllRoles(msg);
        return this.getAllUsers(msg);

      case '!roles':
        return this.getAllRoles(msg);

      case '!auth':
        return this.addUserToRoles(character, roles, msg);

      case '!deauth':
        return this.removeUserFromRoles(character, roles, msg);
    }

    return;
  },

  async getAllUsers(msg) {
    let { 
      data: {
        data: users,
        meta,
      }
    } = await SeatApi.get('/users');

    this.users = users;

    while (meta.current_page !== meta.last_page) {
      let nextPage = meta.current_page + 1;

      let response = await SeatApi.get(`/users?page=${nextPage}`);

      meta = response.data.meta;
      
      for (let user of response.data.data) {
        this.users.push(user);
      }
    }

    return msg.channel.send('Users synchronized with SeAT.');
  },

  async getAllRoles(msg) {
    let req = await SeatApi.get('/roles');

    this.roles = req.data;

    if (msg.content !== '!roles')
      return msg.channel.send('Roles synchronized with SeAT.');

    let response = 'Available roles:```';

    for (let r of this.roles) {
      response = `${response}\n${r.title}`;
    }

    response = response + '```';

    return msg.channel.send(response);
  },

  async addUserToRoles(character, roles, msg) {
    if (!msg.member)
      return msg.channel.send('This command must be run from a Discord server, not a PM.');

    let isAuthorizedRequest = _.find(msg.member.roles.array(), { 'name': process.env.DISCORD_AUTHORIZED_ROLE_NAME });

    if (!isAuthorizedRequest)
      return msg.channel.send('You do not have the roles required to manage authorization');

    let user = _.find(this.users, { 'name': character });

    if (!user) {
      return;
    }

    for (let roleName of roles) {
      let role = _.find(this.roles, { 'title': roleName });

      if (!role) {
        return msg.channel.send(`Couldn't find a role by the name of ${roleName}. Try \`!roles\` to see the available roles.`);
      }

      await SeatApi.post(`/roles/groups`, {
        group_id: user.group_id,
        role_id: role.id
      });

      msg.channel.send(`Added ${user.name} to ${role.title}.`);
    }
  },

  async removeUserFromRoles(character, roles, msg) {
    if (!msg.member)
      return msg.channel.send('This command must be run from a Discord server, not a PM.');

    let isAuthorizedRequest = _.find(msg.member.roles.array(), { 'name': process.env.DISCORD_AUTHORIZED_ROLE_NAME });

    if (!isAuthorizedRequest)
      return msg.channel.send('You do not have the roles required to manage authorization');

    let user = _.find(this.users, { 'name': character });

    if (!user) {
      return;
    }

    for (let roleName of roles) {
      let role = _.find(this.roles, { 'title': roleName });

      if (!role) {
        return msg.channel.send(`Couldn't find a role by the name of ${roleName}. Try \`!roles\` to see the available roles.`);
      }

      await SeatApi.delete(`/roles/groups/${user.group_id}/${role.id}`);

      msg.channel.send(`Removed ${user.name} from ${role.title}.`);
    }
  }

}

module.exports = Seat;
