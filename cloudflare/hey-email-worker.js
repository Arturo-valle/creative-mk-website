export default {
  async email(message) {
    const destinations = [
      "arturo.ordonezv@gmail.com",
      "kmendieta0707@gmail.com"
    ];
    const results = await Promise.allSettled(
      destinations.map((destination) => message.forward(destination))
    );

    if (results.every((result) => result.status === "rejected")) {
      throw results[0].reason;
    }
  }
};
