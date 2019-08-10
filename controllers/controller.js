class Controller {

    constructor() {
        this.context = {};
        this.routes = [];
    }

    addView(path, view, action) {
        this.routes.push({
            type: 'view',
            method: 'GET',
            path: path,
            view: view,
            action: action
        });
    }

    addAction(path, method, action) {
        this.routes.push({
            type: 'action',
            method: method,
            path: path,
            action: action
        });
    }

    register(app) {

        this.routes.forEach((route) => {

            if (route.method === 'GET') {
                if (route.type === 'view') {
                    app.get(route.path, (req, res) => {
                        if (route.action) {
                            route.action(req).then(() => {
                                res.render(route.view, this.context);
                            });
                        } else {
                            res.render(route.view, this.context);
                        }
                    });
                }
                if (route.type === 'action') {
                    app.get(route.path, (req, res) => {
                        route.action && route.action(req, res);
                    });
                }                 
            }

            if (route.method === 'POST') {
                if (route.type === 'action') {
                    app.post(route.path, (req, res) => {
                        route.action && route.action(req, res);
                    });
                } 
            }
        });
    }
}

module.exports = Controller;