export default class {
  constructor(syncMapContext) {
    this.syncMapContext = syncMapContext;
  }

  async isSbuscribed(who) {
    const itemContext = this.syncMapContext.syncMapItems.get(who);
    let itemInstance;
    try {
      itemInstance = await itemContext.fetch();
    } catch (error) {
      if (!JSON.stringify(error).includes('not found')) {
        throw error;
      }
    }
    if (itemInstance) {
      if (itemInstance.data) {
        if (itemInstance.data.isSubscribed === false) {
          return false;
        }
      }
    }
    return true;
  }

  async setSubscriptionStatus(who, isSubscribed, eventId) {
    const itemContext = this.syncMapContext.syncMapItems.get(who);
    let itemInstance;
    try {
      itemInstance = await itemContext.fetch();
    } catch (error) {
      if (!JSON.stringify(error).includes('not found')) {
        throw error;
      }
    }
    let wasSubscribed = true;
    if (itemInstance) {
      if (itemInstance.data) {
        // idenpotent setSubscriptionStatus is ensured by checking eventId
        if (itemInstance.data.eventId === eventId) {
          return {
            isSubscribed: itemInstance.data.isSubscribed,
            wasSubscribed: itemInstance.data.wasSubscribed,
          };
        }
        if (itemInstance.data.isSubscribed === false) {
          wasSubscribed = false;
        }
      }
    }
    const data = {
      isSubscribed,
      wasSubscribed,
      eventId,
    };
    if (itemInstance) {
      await itemContext.update({ data });
    } else {
      await this.syncMapContext.syncMapItems.create({ key: who, data });
    }
    return {
      isSubscribed,
      wasSubscribed,
    };
  }
}
