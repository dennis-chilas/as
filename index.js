const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const path = require("path");

const app = express();

app.listen(4000, () => console.log("listening at 4000"));

app.use(express.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "client/build")));

let scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-playback-state"
  ],
  redirectUri = "http://localhost:4000/callback",
  clientId = "",
  clientSecret = "",
  state = "some-state-of-my-choice";

let spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  console.log(code);
  try {
    var data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    // res.redirect("http://localhost:4000/playlists");
    res.redirect("http://localhost:4000/");
  } catch (err) {
    res.redirect("/#/error/invalid token "+ err);
  }
});



app.get("/playlists", async (req, res) => {
  try {
    let result = await spotifyApi.getUserPlaylists();
    console.log(result.body.items);
   // res.status(200).send(result.body.items);
    res.json(result.body.items);
  } catch (err) {
    res.status(400).send(err);
  }
});






app.get("/login", (request, response) => {
  let html = spotifyApi.createAuthorizeURL(scopes);
  console.log(html);
  response.redirect(html + "&show_dialog=true");
});


app.get("/playing", async(req, res) => {
  try {
    let result = spotifyApi.getMyCurrentPlaybackState({
    })
    .then(function(data) {
      // Output items
      console.log("Now Playing: ",data.body);
      res.status(200).send(result.body);
    }, function(err) {
      console.log('Something went wrong!', err);
    });

} catch (err) {
  res.status(400).send(err);
}
})


app.get("*", (req, res) => {

  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});
