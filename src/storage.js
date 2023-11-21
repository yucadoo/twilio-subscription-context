export default class {
  constructor(syncMapContext) {
    this.syncMapContext = syncMapContext;
  }

  async isSbuscribed(who) {
    const itemContext = this.syncMapContext.syncMapItems.get(who);
    const itemInstance = await itemContext.fetch();
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
    const itemInstance = await itemContext.fetch();
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
    itemContext.update({
      isSubscribed,
      wasSubscribed,
      eventId,
    });
    return {
      isSubscribed,
      wasSubscribed,
    };
  }
}
