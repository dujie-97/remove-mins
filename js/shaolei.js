function Main(tr, td, mainNum) {
    this.tr = tr;
    this.td = td;
    this.mainNum = mainNum; //雷的数量

    this.squares = []; //二位数组，存储所有方块的信息，按行与列的顺序排放.存取使用行和列
    this.tds = []; //存储所有单元格的dom
    this.surplusMain = mainNum; //剩余雷的数量
    this.allRight = false; //右击标的小红旗是否全是雷,用来判断用户是否游戏成功

    this.parent = document.getElementsByClassName('main')[0];
}

//生成n个不重复的数字
Main.prototype.randomNum = function() {
    var square = new Array(this.td * this.tr);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function() {
        return Math.random() - 0.5;
    })
    return square.slice(0, this.mainNum)
}

Main.prototype.init = function() {
    // this.randomNum();
    var rn = this.randomNum(); //雷在格子里的位置
    var n = 0; //用来找格子对应的索引

    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {

            n++;
            //取一个方块在数组里的数据用行和列的形式，找方块周围的方块用坐标的形式去找，行和列的形式与坐标（x，y）完全相反
            if (rn.indexOf(n) != -1) {
                // 如果条件成立，说明现在循环到的这个索引在雷的数组中找到了，表示这个索引对应的是雷
                this.squares[i][j] = {
                    type: 'main',
                    x: j,
                    y: i
                };
            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                };
            }
        }
    }


    // console.log(this.squares);

    this.updateNum();
    this.createDom();

    this.parent.oncontextmenu = function() { //阻止右击默认事件
        return false;
    }

    //剩余雷数
    this.mainNumDom = document.getElementsByClassName('mainNum')[0];
    this.mainNumDom.innerHTML = this.surplusMain;
}

//创建表格
Main.prototype.createDom = function() {
    var This = this;
    var table = document.createElement('table');

    for (var i = 0; i < this.tr; i++) { //循环行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for (var j = 0; j < this.td; j++) { //循环列
            var domTd = document.createElement('td');
            // domTd.innerHTML = 0;

            domTd.pos = [i, j]; //把格子对应的行与列存到格子身上，为了下面通过这个值到数组里去取到对应的数据
            domTd.onmousedown = function() {
                // var event = Event;
                This.play(event, this); //this指的是点击的td，This指的是实例对象Main
            };
            this.tds[i][j] = domTd; //把所有创建的td添加到数组中



            // if (this.squares[i][j].type == 'main') {
            //     domTd.className = 'main-lei';
            // } else if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = ''; //避免多次点击创建多个
    this.parent.appendChild(table);
}


//找某个方格周围的8个方格
Main.prototype.getAround = function(square) {
    var x = square.x;
    var y = square.y;
    var result = []; //找到周围的格子的坐标返回出去（二位数组）

    // x-1,y-1  x,y-1   x+1,y-1
    // x-1,y    x,y     x+1,y
    // x-1,y+1  x,y+1   x,y+1

    //通过坐标去循环九宫格
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 || //格子超出左边的范围
                j < 0 || //格子超出上边的范围
                i > this.td - 1 || //格子超出右边的范围
                j > this.tr - 1 || //格子超出下边的范围
                (i == x && j == y) || //当前循环到的格子是自己
                this.squares[j][i].type == 'main' //周围的格子是雷
            ) {
                continue;
            }

            result.push([j, i]); //要以行与列的形式返回出去，因为到时候需要他去取数组里的数据
        }
    }
    return result;
};

//更新所有的数字
Main.prototype.updateNum = function() {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //只更新雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]); //获取到每一个雷周围的数字
            for (var k = 0; k < num.length; k++) {
                // num[k] == [0,1]
                // num[k][0] == 0
                // num[k][1] ==1

                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}

//开始游戏
Main.prototype.play = function(ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') { //点击的是左键,后面的条件是为了限制用户标完小红旗后取消再左击
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

        if (curSquare.type == 'number') {
            //用户点击的是数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];

            if (curSquare.value == 0) {
                //用户点到数字0
                obj.innerHTML = ''; //如果是0就不显示

                function getAllZero(square) {
                    var around = This.getAround(square); //找到了周围的n个格子

                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0]; //行
                        var y = around[i][1]; //列

                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if (This.squares[x][y].value == 0) {
                            //如果以某个格子为中心找到的值为0，那就需要接着调用函数(递归)
                            if (!This.tds[x][y].check) {
                                //给对应的td添加一个check属性，用于确定这个格子是否被找过，如果找过的话值为true，下一次就不会再找了
                                This.tds[x][y].check = true;

                                getAllZero(This.squares[x][y]);
                            }

                        } else {
                            //如果找到的格子四周的值不为0，那就显示他的值
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }

                getAllZero(curSquare);
            }
        } else {
            //用户点击的是雷
            this.gameOver(obj);
        }
    }

    //用户点击的是右键
    if (ev.which == 3) {
        //如果右击的是一个数字，那就不能右击
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag'; //切换class

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'main') {
            this.allRight = true; //用户标的小红旗都是雷
        } else {
            this.allRight = false;
        }

        if (obj.className == 'flag') {
            this.mainNumDom.innerHTML = --this.surplusMain;
        } else {
            this.mainNumDom.innerHTML = ++this.surplusMain;
        }

        if (this.surplusMain == 0) {
            //剩余雷的数量为0时，表示用户已经标完小红旗了，要判断游戏是结束还是成功
            if (this.allRight) {
                //这个条件成立的话说明全部标对了
                alert('Great! you success!');
            } else {
                alert('Sorry! you fail!');
                this.gameOver();
            }
        }
    }
};

//游戏失败
Main.prototype.gameOver = function(clickTd) {
    // 1.显示所有的雷
    // 2.取消格子的点击事件
    // 3.给点击的那个雷标红

    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'main') {
                this.tds[i][j].className = 'main-lei';
            }

            this.tds[i][j].onmousedown = null;
        }
    }

    if (clickTd) {
        clickTd.style.backgroundColor = '#f00';
    }
}

//上边button的功能
var btns = document.getElementsByTagName('button');

var main = null; //存储生成的实例
var ln = 0; //处理当前选中的状态

var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
]; //不同级别的行数，列数，雷数

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function() {
        btns[ln].className = '';
        this.className = 'active';

        main = new Main(...arr[i]);
        main.init();

        ln = i;
    }
}



btns[0].onclick(); //初始化

btns[3].onclick = function() {
        main.init();
    }
    // var main = new Main(28, 28, 99);
    // main.init();