import * as _ from "lodash";

class Message {
  private _deviceTime: Date;
  private _moscaTime: Date;
  private _mongoTime: Date;
  private _socketTime: Date;
  private _totalSentMessages: number;

  private constructor() {}

  setDeviceTime(data: string) {
    try {
      this._deviceTime = this._convertDate(data);
    } catch (error) {
      throw new TypeError("Device time is not valid");
    }
  }

  setMoscaTime(data: string) {
    try {
      this._moscaTime = this._convertDate(data);
    } catch (error) {
      throw new TypeError("Mosca time is not valid");
    }
  }

  setMongoTime(data: string) {
    try {
      this._mongoTime = this._convertDate(data);
    } catch (error) {
      throw new TypeError("Mongo time is not valid");
    }
  }

  setSocketTime(data: string) {
    try {
      this._socketTime = this._convertDate(data);
    } catch (error) {
      throw new TypeError("Socket time is not valid");
    }
  }

  setTotalSentMessages(data: string) {
    this._totalSentMessages = _.toNumber(data);
    if (!_.isNumber(this._totalSentMessages) || _.isEmpty(data)) {
      throw new TypeError("Order is not valid");
    }
  }

  get deviceTime(): Date {
    return this._deviceTime;
  }

  get deviceTimestamp(): number {
    return this._deviceTime.getTime();
  }

  get moscaTime(): Date {
    return this._moscaTime;
  }

  get mongoTime(): Date {
    return this._mongoTime;
  }

  get moscaTimestamp(): number {
    return this._deviceTime.getTime();
  }

  get socketTime(): Date {
    return this._socketTime;
  }

  get socketTimestamp(): number {
    return this._socketTime.getTime();
  }

  get totalSentMessages(): number {
    return this._totalSentMessages;
  }

  get delay() {
    return this.socketTime.getTime() - this.deviceTime.getTime();
  }

  private _convertDate(data: string): Date {
    const timestamp = _.toNumber(data);
    if (_.isNaN(timestamp) || _.isEmpty(data)) {
      throw new TypeError("date is not valid");
    }
    const date = new Date(timestamp);
    if (!_.isDate(date)) {
      throw new TypeError("date time is not valid");
    }
    return date;
  }

  public static instance(data: String): Message {
    if (data == undefined || data.length == 0) {
      throw new TypeError("Data can't be empty");
    }
    const row = data.split(";");
    if (row.length < 4) {
      throw new TypeError("Message doens't have enough data");
    }

    const message = new Message();
    message.setDeviceTime(row[0]);
    message.setMoscaTime(row[1]);
    message.setSocketTime(row[2]);
    message.setMongoTime(row[3]);
    message.setTotalSentMessages(row[4]);

    return message;
  }
}

export { Message };
