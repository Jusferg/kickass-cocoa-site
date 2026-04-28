exports.handler = async (event) => {
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;

  try {
    const payload = JSON.parse(event.body || "{}");

    // Send to Zapier
    if (zapierUrl) {
      await fetch(zapierUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    // Respond properly to Netlify
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};