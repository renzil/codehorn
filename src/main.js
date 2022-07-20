const model = {
};

function getUserDoc(userUid) {
    return firebase.firestore().collection("users").doc(userUid);
}
function getGitHubDoc(userUid) {
    return getUserDoc(userUid).collection("providers").doc("github");
}
function callGithubApi(endpoint, accessToken) {
    return fetch(`https://api.github.com${endpoint}`, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `token ${accessToken}`,
        }
    }).then(response => response.json());
}

function loadGitHubModel(userUid) {
    return getGitHubDoc(userUid).get().then(snapshot => {
        if (snapshot.exists) {
            const data = snapshot.data();
            model["github"] = data;
            return model;
        }
        return null;
    }).then(model => onGitHubModelLoaded(model));
}

/**
 * Function called when clicking the Login/Logout button.
 */
function toggleSignIn() {
    if (!firebase.auth().currentUser) {
        var provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('repo');
        provider.addScope('admin:repo_hook');
        firebase.auth().signInWithPopup(provider).then(async function (result) {
            console.log("signInWithPopup DONE");
            await getUserDoc(result.user.uid).set({
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL,
            });
            await getGitHubDoc(result.user.uid).set({
                profile: result.additionalUserInfo.profile,
                credential: {
                    accessToken: result.credential.accessToken,
                    pendingToken: result.credential.pendingToken,
                    providerId: result.credential.providerId,
                    signInMethod: result.credential.signInMethod,
                },
            });
            loadGitHubModel(result.user.uid);
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
            } else {
                console.error(error);
            }
        });
    } else {
        firebase.auth().signOut();
    }
    document.getElementById('quickstart-sign-in').disabled = true;
}

function onRepoListItemClicked(event) {

}

function onGitHubModelLoaded(model) {
    console.log("MODEL: ", model);
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    const token = model.github.credential.accessToken;
    const my_github_user_name = model.github.profile.login;
    // The signed-in user info.
    document.getElementById('quickstart-oauthtoken').textContent = token;

    callGithubApi("/user/repos", token).then(repos => {
        console.log('All repos: ', repos);
        const my_repos = repos.filter(repo => repo.owner.login === my_github_user_name)
        console.log('My repos:', my_repos);
        const repo_list_items_str = my_repos.map(repo => `<li class="mdl-list__item" data-repo-name="${repo.name}">
<div class="repo-list-item-container">
<p class="mdl-list__item-primary-content">${repo.name}</p>
<div>
  <div class="mdl-spinner mdl-js-spinner is-active"></div>
  <i class="material-icons" style="display: none;">check_circle</i>
  <i class="material-icons" style="display: none;">notifications</i>
</div>
</div>
</li>`).join("");
        const repos_list = document.getElementById("repos-list");
        repos_list.innerHTML = repo_list_items_str;

        (function upgradeSpinners() {
            componentHandler.upgradeDom();
            /*repo_list_items = document.getElementsByClassName("mdl-spinner");
            for (var i = 0; i < repo_list_items.length; i++) {
              componentHandler.upgradeElement(repo_list_items[i]);
            }*/
        })();


        (function addRepoClickHandlers() {
            repo_list_items = document.getElementsByClassName("mdl-list__item");
            for (var i = 0; i < repo_list_items.length; i++) {
                repo_list_items[i].addEventListener('click', function () {
                    console.log("clicked repo: ", this.innerText);
                });
            }
        })();

        (function updateRepoHooks(repos) {
            repos.forEach(repo => {
                callGithubApi(`/repos/${repo.owner.login}/${repo.name}/hooks`, token).then(hooks => {
                    //document.querySelector(`[data-repo-name="${repo.name}"]`).innerText = `${repo.name} (${hooks.length})`;
                    console.log(hooks);
                });
            });
        })(my_repos);
    });
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
    // Listening for auth state changes.
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("onAuthStateChanged user DONE");
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
            document.getElementById('quickstart-sign-in').textContent = 'Sign out';
            document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');

            //loadGitHubModel(uid);
        } else {
            // User is signed out.
            document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
            document.getElementById('quickstart-sign-in').textContent = 'Sign in with GitHub';
            document.getElementById('quickstart-account-details').textContent = 'null';
            document.getElementById('quickstart-oauthtoken').textContent = 'null';
        }
        document.getElementById('quickstart-sign-in').disabled = false;
    });

    document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
}

window.onload = function () {
    initApp();
};