// JavaScript Promise
// 运行: node 07-promise.js

console.log('=== JavaScript Promise ===\n');

// ========== 1. Promise 基础 ==========
console.log('1. Promise 基础');

// 创建 Promise
const promise = new Promise((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve('操作成功');
        } else {
            reject(new Error('操作失败'));
        }
    }, 100);
});

// 使用 Promise
promise
    .then(result => console.log('成功:', result))
    .catch(error => console.log('失败:', error.message))
    .finally(() => console.log('完成'));

// ========== 2. Promise 状态 ==========
console.log('\n2. Promise 三种状态');
console.log(`
┌────────────────────────────────────────────────────┐
│                                                    │
│   pending ─────► fulfilled (resolve 被调用)         │
│      │                                             │
│      └─────────► rejected (reject 被调用)          │
│                                                    │
│   注意: 状态一旦改变，不可再变                         │
└────────────────────────────────────────────────────┘
`);

// ========== 3. Promise 链式调用 ==========
console.log('3. Promise 链式调用');

Promise.resolve(1)
    .then(value => {
        console.log('链 1:', value);
        return value + 1;
    })
    .then(value => {
        console.log('链 2:', value);
        return value + 1;
    })
    .then(value => {
        console.log('链 3:', value);
        // 返回新 Promise
        return new Promise(resolve => {
            setTimeout(() => resolve(value + 1), 50);
        });
    })
    .then(value => {
        console.log('链 4 (异步):', value);
    });

// ========== 4. Promise 静态方法 ==========
console.log('\n4. Promise 静态方法');

// Promise.resolve / Promise.reject
Promise.resolve('直接成功').then(v => console.log('resolve:', v));
Promise.reject(new Error('直接失败')).catch(e => console.log('reject:', e.message));

// Promise.all - 全部成功才成功
const promises = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
];

Promise.all(promises).then(values => {
    console.log('Promise.all:', values); // [1, 2, 3]
});

// Promise.race - 取第一个完成的
Promise.race([
    new Promise(resolve => setTimeout(() => resolve('慢'), 200)),
    new Promise(resolve => setTimeout(() => resolve('快'), 100))
]).then(value => console.log('Promise.race:', value)); // '快'

// Promise.allSettled - 等待全部完成（无论成功失败）
Promise.allSettled([
    Promise.resolve('成功'),
    Promise.reject(new Error('失败'))
]).then(results => {
    console.log('Promise.allSettled:');
    results.forEach(r => {
        if (r.status === 'fulfilled') {
            console.log('  ✓', r.value);
        } else {
            console.log('  ✗', r.reason.message);
        }
    });
});

// Promise.any - 取第一个成功的
Promise.any([
    Promise.reject(new Error('失败1')),
    Promise.resolve('成功'),
    Promise.reject(new Error('失败2'))
]).then(value => console.log('Promise.any:', value)); // '成功'

// ========== 5. 错误处理 ==========
console.log('\n5. 错误处理');

// 链式 catch
Promise.resolve()
    .then(() => {
        throw new Error('出错了');
    })
    .catch(error => {
        console.log('捕获错误:', error.message);
        return '恢复正常';
    })
    .then(value => {
        console.log('继续执行:', value);
    });

// 未处理的 rejection
process.on('unhandledRejection', (reason, promise) => {
    console.log('未处理的 rejection:', reason);
});

// ========== 6. async/await ==========
console.log('\n6. async/await');

async function fetchUser(id) {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 50));
    if (id <= 0) throw new Error('无效 ID');
    return { id, name: `用户${id}` };
}

async function main() {
    try {
        // 串行请求
        const user1 = await fetchUser(1);
        console.log('串行获取:', user1);
        
        // 并行请求
        const [user2, user3] = await Promise.all([
            fetchUser(2),
            fetchUser(3)
        ]);
        console.log('并行获取:', user2, user3);
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

main();

// ========== 7. 手写 Promise ==========
console.log('\n7. 手写 Promise (简化版)');

class MyPromise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        
        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn());
            }
        };
        
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };
        
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }
    
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };
        
        return new MyPromise((resolve, reject) => {
            const handleFulfilled = () => {
                queueMicrotask(() => {
                    try {
                        const result = onFulfilled(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            
            const handleRejected = () => {
                queueMicrotask(() => {
                    try {
                        const result = onRejected(this.reason);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            
            if (this.state === 'fulfilled') {
                handleFulfilled();
            } else if (this.state === 'rejected') {
                handleRejected();
            } else {
                this.onFulfilledCallbacks.push(handleFulfilled);
                this.onRejectedCallbacks.push(handleRejected);
            }
        });
    }
    
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    
    static resolve(value) {
        return new MyPromise(resolve => resolve(value));
    }
    
    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason));
    }
}

// 测试手写 Promise
const myPromise = new MyPromise((resolve) => {
    setTimeout(() => resolve('MyPromise 成功'), 50);
});

myPromise
    .then(value => {
        console.log('MyPromise:', value);
        return value + '!';
    })
    .then(value => console.log('链式:', value));

console.log('\n=== Promise 完成 ===');
