function callWhenAlltrue(statuses: boolean[], cb: any) {
  var interval: NodeJS.Timer;
  interval = setInterval(function () {
    var isdone = statuses.reduce((pv: any, v: any) => pv && v, true);

    if (isdone) {
      clearInterval(interval);
      cb();
    }
  }, 10);
}

function callWhenXEqualY({ x, y }: { x: any; y: any }, cb: any) {
  var interval: NodeJS.Timer;
  interval = setInterval(function () {
    var isdone = x === y;
    if (isdone) {
      clearInterval(interval);
      cb();
    }
  }, 10);
}

export async function callWhenXEqualYAsync({ x, y }: { x: any; y: any }) {
  await new Promise<void>((resolve) => {
    var interval: NodeJS.Timer;
    interval = setInterval(function () {
      var isdone = x === y;
      if (isdone) {
        clearInterval(interval);
        resolve();
      }
    }, 10);
  });
}

export { callWhenAlltrue, callWhenXEqualY };
