/**
 *
 * @param {object} bron        出生点
 * @param {object} obstacles      障碍物数组
 * @param {object} target      目标
 * @param {object} map         地图
 * @param {object} girdLength  格子长度
 * */
function getPath(bron, obstacles, target, map, girdLength) {
    var open = [];
    var closed = [];
    var fastTable = {};    //地图坐标的字典

    //生成地图坐标的字典
    map.forEach(function (t) {
        fastTable[t.x + '' + t.y] = t;
    });
    //处理参数
    var params = formatParams(bron, obstacles, target, map);
    bron = params.bron;
    obstacles = params.obstacles;
    target = params.target;
    //处理出生点值
    bron.G = 0;
    bron.H = H(bron, target, girdLength);
    bron.F = F(bron);
    //更改当前作用点
    var nowGird = bron;
    //将障碍物加到closed列表
    obstacles.forEach(function (t) {
        closed.push(t);
    });
    //先把出生点放到closed列表中
    closeFn(closed, bron);

    //开始BFS所有
    for(; closed.indexOf(target) < 0;) {
        //把可以走的格子放到open列表
        openFn(open, closed, nowGird, map, girdLength, fastTable);
        //计算open列表中格子的G H F值
        caleF(open, nowGird, target, girdLength);
        //根据F值排序
        open.sort(function(t1, t2){
            return t1.F - t2.F;
        });
        //移动作用点
        nowGird = open.shift();
        closeFn(closed, nowGird);
    }
/////////////////////////////////////////////////////////////////////////显示最优路径中的一条
    var route = [];
    nowGird = target;
    route.unshift(nowGird);
    for(;route.indexOf(bron) < 0;) {
        var around = getAround(closed, obstacles, nowGird, girdLength);
        around.sort(function(t1, t2){
            return t1.F - t2.F;
        });
        nowGird = around.shift();
        route.unshift(nowGird);
    }

    return route;
}

/**
 * 获取移动量   (地形越难走移动量越大)
 * @param {object} now        当前点
 * @return {number}
 * */
function G(now) {
    return now.G + 1;
}
/**
 * 移动量估算值  (从当前方块到终点的移动量估算值)
 * @param {object} now        当前点
 * @param {object} target        目标点
 * @param {object} girdLength        格子长度
 * @return {number}
 * */
function H(now, target, girdLength) {
    return Math.abs(target.x - now.x) / girdLength + Math.abs(target.y - now.y) / girdLength;
}
/**
 * 和值    (等于G+H)
 * @param {object} self        当前点
 * */
function F(self) {
    return self.G + self.H;
}

/**
 * open函数    (添加到open列表)
 * @param {object} open        open列表
 * @param {object} closed         closed列表
 * @param {object} point          当前点
 * @param {object} map          地图中所有的点
 * @param {object} girdLength          格子长度
 * */
function openFn(open, closed, point, map, girdLength, fastTable) {

    var results = [];

    if(fastTable[point.x + '' + (point.y + girdLength)]) {
        results.push(fastTable[point.x + '' + (point.y + girdLength)]);
    }
    if(fastTable[point.x + '' + (point.y - girdLength)]) {
        results.push(fastTable[point.x + '' + (point.y - girdLength)]);
    }
    if(fastTable[(point.x + girdLength) + '' + point.y]) {
        results.push(fastTable[(point.x + girdLength) + '' + point.y]);
    }
    if(fastTable[(point.x - girdLength) + '' + point.y]) {
        results.push(fastTable[(point.x - girdLength) + '' + point.y]);
    }

    results.forEach(function (t) {

        if(!canReach(open, closed, t)) {
            return;
        }
        open.push(t);
    });



    // map.forEach(function (t) {
    //
    //     if(!canReach(open, closed, t)) {
    //         return;
    //     }
    //     if( (Math.abs(t.x - point.x) <= girdLength &&
    //             Math.abs(t.y - point.y) <= girdLength) &&
    //         !(Math.abs(t.x - point.x) === girdLength &&
    //             Math.abs(t.y - point.y) === girdLength)
    //     ) {
    //         open.push(t);
    //     }
    // });


}
/**
 * close函数    (添加到close列表)
 * @param {object} closed        closed列表
 * @param {object} item          待加入点
 * */
function closeFn(closed, item) {
    closed.push(item);
}
/**
 * 计算open列表中所有项F值
 * @param {object} open        open列表
 * @param {object} now          当前点
 * @param {object} target          目标点
 * @param {object} girdLength          格子长度
 * */
function caleF(open, now, target, girdLength) {
    open.forEach(function (t) {
        if(!t.F) {
            t.G = G(now);
            t.H = H(now, target, girdLength);
            t.F = F(t);
        }
    });
}
/**
 * 检测是否可以走
 * @param {object} open        open列表
 * @param {object} close        closed列表
 * @param {object} gird          检测的点
 * */
function canReach(open, close, gird) {
    var i, l;
    for(i = 0, l = open.length; i < open.length ; ++i){
        if(open.hasOwnProperty(i)) {
            if(open.indexOf(gird) > -1) {
                return false;
            }
        }
    }
    for(i = 0, l = close.length; i < close.length ; ++i){
        if(close.hasOwnProperty(i)) {
            if(close.indexOf(gird) > -1) {
                return false;
            }
        }
    }
    return true;
}
/**
 * 检测他四周的格子
 * @param {object} container        所有可选点的集合
 * @param {object} obstacles        障碍物
 * @param {object} point            原点
 * @param {object} girdLength       格子尺寸
 * */
function getAround(container, obstacles, point, girdLength) {
    var result = [];
    container.forEach(function (t) {
        if(obstacles.indexOf(t) >= 0) {
            return;
        }
        if( (Math.abs(t.x - point.x) <= girdLength &&
                Math.abs(t.y - point.y) <= girdLength) &&
            !(Math.abs(t.x - point.x) === girdLength &&
                Math.abs(t.y - point.y) === girdLength) &&
            t !== point
        ) {
            result.push(t);
        }
    });
    return result;
}
/**
 * 格式化参数
 * @param {object} bron        出生点
 * @param {object} obstacles   障碍物数组
 * @param {object} target      目标
 * @param {object} map        地图
 * */
function formatParams(bron, obstacles, target, map) {
    var res = {bron: null, obstacles: [], target: null};
    for(var i in map) {
        if(map.hasOwnProperty(i)) {
            //处理出生点
            if(map[i].x === bron.x && map[i].y === bron.y) {
                res.bron = map[i];
            }
            //处理目标点
            if(map[i].x === target.x && map[i].y === target.y) {
                res.target = map[i];
            }
            //处理障碍物
            obstacles.forEach(function (t) {
                if(t.x === map[i].x && map[i].y === t.y) {
                    res.obstacles.push(map[i]);
                }
            });
        }
    }
    return res;
}

module.exports = {
    getPath: getPath
};