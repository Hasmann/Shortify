exports.landingPage = async (req, res) => {
  try {
    const linkRes = await Link.find();
    res.render("index", { linkRes: linkRes });
  } catch (err) {
    res.send(err);
  }
};
