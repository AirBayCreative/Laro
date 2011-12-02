/**
 * Animation
 * {Class}
 * ������
 */

Laro.register('.action', function (La) {

	var Class = La.Class || La.base.Class,
		extend = La.extend;

	/**
	 * @param anim {Object} ��json���������ȡ��anim ����
			{
				"nbrOfFrames": 73,
				"name": "TimeTrap",
				"atlas": "atlas/game/timetrap",
				"type": "animation",
				"image": "anims/timetrap.png",
				"pivoty": 128,
				"framerate": 30,
				"pivotx": 256,
				"events": []
			}
	 * @param frames {Array} ��json�����ļ������õ�ÿ֡��λ����Ϣ
	 */
	var Animation = Class(function (anim, frames) {
		extend(this, anim);

		this.frames = frames;
		if (anim.framerate == undefined) anim.framerate = 20;
		// �������ִ����Ҫ��ʱ��
		this.animationLength = frames.length / anim.framerate;
	}).methods({
		// ��ȡ����ʱ����ָ��ʱ���[from, to]�в�����¼�
		getEvents: function (from, to) {
			var events = [];
			for (var e = 0; e < this.events.length; e ++) {
				var evt = this.events[e];
				if (evt.time >= from && evt.time < to) {
					events.push(evt.name);
				}
			}
			return events;
		},
		// ��ȡ��һ�������ڣ�ָ��ʱ����ڣ������¼��Ĵ�������ʱ��
		getTimeForNextEvent: function (from, to) {
			var first = -1;
			for (var e = 0; e < this.events.length; e ++) {
				var evt = this.events[e];
				if (evt.time > from && evt.time < to) {
					if (first != -1) return first;
					first = evt.time;
				}
			}
			return first;
		},
		// ��������ʱ�����䣬����н����������е��¼�push����
		getEventsSlow: function (from, to, start, end, dt) {
			var events = [],
				e,
				evt;
			for (e = 0; e < this.events.length; e++) {
				evt = this.events[e];
				if (evt.time >= from && evt.time < end) {
					events.push(evt.name);
				}
			}

			for (e = 0; e < this.events.length; e ++) {
				evt = this.events[e];
				if (evt.time >= start && evt.time < to) {
					events.push(evt.name);
				}
			}

			return events;
		}
	});

	this.Animation = Animation;
	Laro.extend(this);
		
})
