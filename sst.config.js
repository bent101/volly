"use strict";
/// <reference path="./.sst/platform/config.d.ts" />
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports["default"] = $config({
    app: function (input) {
        return {
            name: "volly",
            removal: (input === null || input === void 0 ? void 0 : input.stage) === "production" ? "retain" : "remove",
            protect: ["production"].includes(input === null || input === void 0 ? void 0 : input.stage),
            home: "aws"
        };
    },
    run: function () {
        return __awaiter(this, void 0, void 0, function () {
            var vpc, db, dbConnectionString, email, auth, replicationBucket, zeroEnv, zeroCacheUrl, cluster, replicationManager, zeroCache;
            return __generator(this, function (_a) {
                vpc = new sst.aws.Vpc("Vpc", {
                    bastion: true,
                    nat: "managed"
                });
                db = new sst.aws.Postgres("Database", {
                    vpc: vpc,
                    dev: {
                        username: "postgres",
                        password: "password",
                        database: "local",
                        port: 7004
                    }
                });
                dbConnectionString = $interpolate(templateObject_1 || (templateObject_1 = __makeTemplateObject(["postgresql://", ":", "@", ":", "/", ""], ["postgresql://", ":", "@", ":", "/", ""])), db.username, db.password, db.host, db.port, db.database);
                email = new sst.aws.Email("Email", {
                    sender: "bentomlin101@gmail.com"
                });
                auth = new sst.aws.Auth("Auth", {
                    issuer: {
                        handler: "packages/functions/auth/index.handler",
                        link: [email, db]
                    }
                });
                new sst.x.DevCommand("Studio", {
                    link: [db],
                    dev: {
                        command: "npm run db:studio -w @volly/db"
                    }
                });
                replicationBucket = $dev
                    ? undefined
                    : new sst.aws.Bucket("ReplicationBucket");
                zeroEnv = __assign({ ZERO_UPSTREAM_DB: dbConnectionString, ZERO_AUTH_JWKS_URL: $interpolate(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", "/.well-known/jwks.json"], ["", "/.well-known/jwks.json"])), auth.url), ZERO_REPLICA_FILE: "sync-replica.db", ZERO_IMAGE_URL: "rocicorp/zero:0.19.2025043001" }, (replicationBucket && {
                    ZERO_LITESTREAM_BACKUP_URL: $interpolate(templateObject_3 || (templateObject_3 = __makeTemplateObject(["s3://", "/backup"], ["s3://", "/backup"])), replicationBucket.name)
                }));
                zeroCacheUrl = "http://localhost:4848/";
                if ($dev) {
                    new sst.x.DevCommand("ZeroDev", {
                        environment: zeroEnv,
                        dev: {
                            command: "npx zero-cache-dev -p packages/db/schema.ts"
                        }
                    });
                }
                else {
                    cluster = new sst.aws.Cluster("Cluster", {
                        vpc: vpc
                    });
                    replicationManager = new sst.aws.Service("ReplicationManager", {
                        cluster: cluster,
                        dev: false,
                        cpu: "0.5 vCPU",
                        memory: "1 GB",
                        architecture: "arm64",
                        image: zeroEnv.ZERO_IMAGE_URL,
                        link: [replicationBucket],
                        health: {
                            command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
                            interval: "5 seconds",
                            retries: 3,
                            startPeriod: "300 seconds"
                        },
                        environment: __assign(__assign({}, zeroEnv), { ZERO_CHANGE_MAX_CONNS: "3", ZERO_NUM_SYNC_WORKERS: "0" }),
                        loadBalancer: {
                            public: false,
                            ports: [
                                {
                                    listen: "80/http",
                                    forward: "4849/http"
                                },
                            ]
                        },
                        transform: {
                            loadBalancer: {
                                idleTimeout: 3600
                            },
                            target: {
                                healthCheck: {
                                    enabled: true,
                                    path: "/keepalive",
                                    protocol: "HTTP",
                                    interval: 5,
                                    healthyThreshold: 2,
                                    timeout: 3
                                }
                            }
                        }
                    });
                    zeroCache = new sst.aws.Service("ZeroCache", {
                        cluster: cluster,
                        dev: false,
                        cpu: "1 vCPU",
                        memory: "2 GB",
                        architecture: "arm64",
                        image: zeroEnv.ZERO_IMAGE_URL,
                        link: [replicationBucket],
                        health: {
                            command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
                            interval: "5 seconds",
                            retries: 3,
                            startPeriod: "300 seconds"
                        },
                        environment: __assign(__assign({}, zeroEnv), { ZERO_CHANGE_STREAMER_URI: replicationManager.url }),
                        logging: {
                            retention: "1 month"
                        },
                        loadBalancer: {
                            public: true,
                            rules: [{ listen: "80/http", forward: "4848/http" }]
                        },
                        transform: {
                            target: {
                                healthCheck: {
                                    enabled: true,
                                    path: "/keepalive",
                                    protocol: "HTTP",
                                    interval: 5,
                                    healthyThreshold: 2,
                                    timeout: 3
                                },
                                stickiness: {
                                    enabled: true,
                                    type: "lb_cookie",
                                    cookieDuration: 120
                                },
                                loadBalancingAlgorithmType: "least_outstanding_requests"
                            }
                        }
                    });
                    zeroCacheUrl = zeroCache.url;
                }
                new sst.aws.StaticSite("Web", {
                    build: {
                        output: "dist",
                        command: "npm run build -w @volly/web"
                    },
                    dev: {
                        command: "npm run dev -w @volly/web"
                    },
                    environment: {
                        VITE_ZERO_CACHE_URL: zeroCacheUrl,
                        VITE_AUTH_ISSUER_URL: auth.url
                    }
                });
                return [2 /*return*/, { zeroCacheUrl: zeroCacheUrl }];
            });
        });
    }
});
var templateObject_1, templateObject_2, templateObject_3;
