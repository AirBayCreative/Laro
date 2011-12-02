/**
 * Exception
 * error handler & notifier
 * @require [global]
 */

Laro.register('.err', function (La) {
	
	/* runtime Error ��չ */
	function RuntimeException (msg) {
		this.assign(msg);
	}

	RuntimeException.prototype = new Error();
	RuntimeException.prototype.constructor = RuntimeException;

	RuntimeException.prototype.assign = function (msg) {
		this.message = msg === undefined ? '' : msg;
	};

	/* AssertionError */
	function AssertionError (msg) {
		this.assign(msg);
	}

	AssertionError.prototype = new RuntimeException();
	AssertionError.prototype.constructor = AssertionError;

	/* Exception */
	function Exception (msg) {
		this.assign(msg);
	}

	Exception.prototype = new RuntimeException();
	Exception.prototype.constructor = Exception;

	/* interface */
	// �����������쳣
	this.assert = function (condition, msg) {
		if (!condition) {
			throw new AssertionError(msg);
		}
	};
	this.RuntimeException = RuntimeException;
	this.AssertionError = AssertionError;
	this.Exception = Exception;
    
    // export to Laro
    Laro.extend(this);

})
