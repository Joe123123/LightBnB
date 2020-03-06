module.exports = function(router, database) {
  router.get("/properties", (req, res) => {
    if (req.query.owner_id) {
      database
        .getPropertiesById(req.query.owner_id, 20)
        .then(properties => {
          return res.send({ properties });
        })
        .catch(e => {
          console.error(e);
          res.send(e);
        });
    } else {
      database
        .getAllProperties(req.query, 20)
        .then(properties => {
          return res.send({ properties });
        })
        .catch(e => {
          console.error(e);
          res.send(e);
        });
    }
  });

  router.get("/reservations", (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.error("💩");
      return;
    }
    database
      .getAllReservations(userId)
      .then(reservations => res.send({ reservations }))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  router.post("/properties", (req, res) => {
    const userId = req.session.userId;
    database
      .addProperty({ ...req.body, owner_id: userId })
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  // add my own

  // router.get("/properties", (req, res) => {
  //   const userId = req.session.userId;
  //   database
  //     .getPropertiesById(userId, 20)
  //     .then(properties => res.send({ properties }))
  //     .catch(e => {
  //       console.error(e);
  //       res.send(e);
  //     });
  // });

  return router;
};
