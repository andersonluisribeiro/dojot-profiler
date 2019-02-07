import { Request, Response } from "express";
import fs = require("fs");
import * as _ from "lodash";
import shell = require("shelljs");
import logger from "../util/logger";
import util = require("util");
import { ResultFile } from "../models/ResultFile";
import { File } from "../models/File";
import { SocketIoClient } from "../models/SocketioClient";
import { FileLine } from "../models/FileLine";

export let create = (req: Request, res: Response) => {
  const server = req.body.server;
  const token = req.body.token;
  const tenant = req.body.tenant;
  const device = req.body.device;
  const messages = _.toInteger(req.body.messages);
  const perSecond = _.toInteger(req.body.perSecond);

  let data: any = [];

  try {
    logger.debug(`Using server: ${server}`);
    const client = new SocketIoClient(server, 1000, token);

    client.onMessage((data: any) => {
      logger.debug(`Message received: ${util.inspect(data)}`);

      const file = File.instance;
      const message = FileLine.instance(data);

      fs.appendFile(file.path, message.content, err => {
        if (err) logger.debug(`Error writing message: ${util.inspect(data)}`);

        if (message.last) {
          logger.debug(`Last message: ${util.inspect(data)}`);

          fs.rename(file.path, file.newPath, err => {
            if (err) console.log("Error: " + err);
          });
        }
      });
    });

    client.start();

    shell.exec(
      `mqtt-beamer ${server} ${tenant} ${device} ${perSecond} ${messages}`,
      { async: true },
      () => {
        const watcher = fs.watch("/home/uploads", (eventType, filename) => {
          if (filename != "result.csv") {
            watcher.close();
            client.close();
            fs.readdir("/home/uploads", (err, files) => {
              data = files.map(f => {
                const result = new ResultFile(f);
                return {
                  name: result.name,
                  formattedName: result.formattedName
                };
              });
              res.json({
                files: data
              });
            });
          }
        });
      }
    );
  } catch (error) {
    console.log("Error: " + error);
  }
};
