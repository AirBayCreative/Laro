/**
 * fsm
 * ����״̬��
 */

Laro.register('.game', function (La) {
		
	var Class = La.Class || La.base.Class,
		SimpleState = La.SimpleState || La.game.SimpleState,
		BaseState = La.BaseState || La.game.BaseState;

	var FSM = Class(function (host, states, onStateChange){
		if (host == undefined) return;
		this.host = host;
		this.onStateChange = onStateChange;
		this.stateArray = [];

		// states list �У�����Ԫ��Ϊһ�飬�ֱ���state��ʶ{Int,��ʶ״̬˳��},�Ͷ�Ӧ��state ��
		for (var i = 0; i < states.length; i += 2) {
			var stateId = states[i],
				stateClass = states[i + 1];

			if (stateClass instanceof SimpleState) {
				this.stateArray[stateId] = stateClass;
			} else {
				this.stateArray[stateId] = new stateClass(host, this, stateId);
			}
		}

		this.currentState = FSM.kNoState;
		this.numSuspended = 0;
		this.suspendedArray = [];
		this.numPreloaded = 0;
		this.preloadedArray = [];
		this.numStates = this.stateArray.length;

	}).methods({
		// ����ĳһ��state
		enter: function (startState, message) {
			this.setState(startState, message);
		},
		// �˳�state���ص���ʼ��״̬
		leave: function () {
			this.setState(FSM.kNoState);
		},
		// ÿ֡״̬������
		update: function (dt) {
			for (var i = 0; i < this.numSuspended; i ++) {
				this.stateArray[this.suspendedArray[i]].suspended(dt);
			}

			if (this.currentState != FSM.kNoState) {
				this.stateArray[this.currentState].update(dt);
				// update ֮�����ж�transition
				if (this.currentState != FSM.kNoState) {
					this.stateArray[this.currentState].transition();
				}
			}
		},
		// ������Ϣ
		message: function (msg) {
			this.currentState != FSM.kNoState && this.stateArray[this.currentState].message(msg);	 
		},
		// ��Ϣ����
		messageSuspended: function (msg) {
			for (var i = 0; i < this.numSuspended; i ++) {
				this.stateArray[this.suspendedArray[i]].message(msg);
			}				  
		},
		// �ı�״̬,����һ���ж��������Ƿ�ı�״̬������һ��״̬
		// ����booleanֵ��ʾ���Ըı��Ƿ�ɹ�
		tryChangeState: function (condition, toState, msg, reEnter, suspendedCurrent) {
			if (reEnter == undefined) { reEnter = true } //�ؽ���ǰ״̬
			if (suspendedCurrent == undefined) { suspendedCurrent = true }
			if (toState == FSM.kNextState) { toState = this.currentState + 1 }

			if (condition 
				&& (toState != this.currentState || reEnter)) { console.log(toState)
				this.setState(toState, msg, suspendedCurrent);
				return true;
			}

			return false;
		},
		// ����״̬
		setState: function (state, msg, suspendedCurrent) {
			if (state == FSM.kNextState) {
				state = this.currentState + 1;
			}

			if (state == FSM.kNoState) {
				// ��ǰ�����״̬ȫ���Ƴ�
				for ( ; this.numSuspended > 0; this.numSuspended --) {
					this.stateArray[this.suspendedArray[this.numSuspended - 1]].leave();
					this.stateArray[this.suspendedArray[this.numSuspended - 1]].isSuspended = false;
				}
				// �ȴ��е�״̬Ҳȫ����ֹ
				for ( ; this.numPreloaded > 0; this.numPreloaded --) {
					this.stateArray[this.preloadedArray[this.numPreloaded - 1]].cancelPreload();
				}
			} else {
				if (suspendedCurrent) { // ��Ҫ����ǰ��״̬
					this.stateArray[this.currentState].suspended();
					this.stateArray[this.currentState].isSuspended = true;
					this.suspendedArray[this.numSuspended ++] = this.currentState;
				} else {
					// �Ƴ���ǰ״̬������ָ��״̬
					if (this.currentState != FSM.kNoState) {
						this.stateArray[this.currentState].leave();
					}

					// ���ָ��״̬��û�й���Ļ�����Ҫ�����й����״̬�˳�
					if (!this.stateArray[state].isSuspended) {
						for ( ; this.numSuspended > 0; this.numSuspended --) {
							this.stateArray[this.suspendedArray[this.numSuspended - 1]].leave();
							this.stateArray[this.suspendedArray[this.numSuspended - 1]].isSuspended = false;
						}
					}
				}
			}

			// ����ȴ��е�״̬���������ָ��״̬����ȡ��
			for (var p = 0; p < this.numPreloaded; p++) {
				this.preloadedArray[p] != state && this.stateArray[this.preloadedArray[p]].cancelPreload();
			}
			this.numPreloaded = 0;
			// �ӵ�ǰ״̬��ָ��״̬
			this.onStateChange != undefined && this.onStateChange(this.currentState, state, msg);

			var lastState = this.currentState;
			this.currentState = state;

			if (this.currentState != FSM.kNoState) {
				if (this.stateArray[this.currentState].isSuspended) {
					// ״̬ת������״̬�ǹ���ģ����������һ��
					this.stateArray[this.currentState].resume(msg, lastState);
					this.stateArray[this.currentState].isSuspended = false;
					-- this.numSuspended;
				} else {
					// ����ָ��״̬
					this.stateArray[this.currentState].enter(msg, lastState);
				}
			}
		},
		// ��ȡ��ǰ״̬
		getCurrentState: function () {
			if (this.currentState == FSM.kNoState) return null;
			return this.stateArray[this.currentState];
		},
		preload: function (state) {
			this.preloadedArray[this.numPreloaded ++] = state;		 
		},
		isSuspended: function (state) {
			return this.stateArray[state].isSuspended;			 
		}
	
	}).statics({
		kNoState : -1, // Ĭ�ϳ�ʼ��״̬��
		kNextState: -2 // Ĭ�Ͻ�����һ��״̬��״̬��
	});

	/**
	 * app �� FSM
	 * ���һЩ�򵥵Ľ�������
	 */
	var AppFSM = FSM.extend().methods({
		draw: function (render) {
			// ���״̬��֧�� draw������draw�������������
			for (var i = 0; i < this.numSuspended; i ++) {
				this.stateArray[this.suspendedArray[i]].draw(render);
			}
			var s = this.getCurrentState();
			!!s && s.draw(render);
		},
		onMouse: function (x, y, left, leftPressed) {
			// ����¼�
			var s = this.getCurrentState();
			!!s && s.onMouse(x, y, left, leftPressed);
		}
	})

	this.FSM = FSM;
	this.AppFSM = AppFSM;
	Laro.extend(this);
		
})
