export default {
  async email(message) {
    await Promise.all([
      message.forward("arturo.ordonezv@gmail.com"),
      message.forward("kmendieta0707@gmail.com")
    ]);
  }
};
