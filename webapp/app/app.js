/* global angular */
angular.module('chemthings', ['ngSanitize'])

.component('app', {
	templateUrl: 'component/app.html',
	controller($interval, Input, Output, Settings, EvalService)
	{
		EvalService.addImport('lib/array-extensions');
		EvalService.addImport('lib/chem');
		EvalService.addImport('lib/chem-eq');
		EvalService.addImport('lib/chem-util');
			
		this.script = window.localStorage.getItem('lastScript') || '';
		
		this.input = Input;
		this.output = Output;
		this.settings = Settings;
		
		this.onType = () =>
		{
			saveFlag = true;
		}
		
		this.saveScript = () =>
		{
			window.localStorage.setItem('lastScript', this.script || '');
		}
		
		this.eval = () =>
		{
			Output.result = undefined;
			EvalService.evaluate(this.script);
			if(!Output.status) Output.status = 'Evaluated successfully.';
		}
		
		this.evalSilent = () => EvalService.evaluate(this.script);
		
		this.evalSilent();
		
		var saveFlag = false;
		$interval(() =>
		{
			if(saveFlag)
			{
				saveFlag = false;
				this.saveScript();
				if(Settings.autorun) this.evalSilent();
			}
		}, 100);
	}
})

.directive('aceEditor', function($timeout)
{
	function resizeEditor(editor, elem)
	{
		var lineHeight = editor.renderer.lineHeight;
		var rows = editor.getSession().getLength();
		
		angular.element(elem).height(rows * lineHeight);
		editor.resize();
	}
	
	return {
		restrict: 'A',
		require: '?ngModel',
		scope: true,
		link(scope, elem, attrs, ngModel)
		{
			var node = elem[0];
			
			/* global ace */
			var editor = ace.edit(node);
			editor.$blockScrolling = Infinity;
			
			editor.setShowPrintMargin(false);
			editor.setTheme('ace/theme/textmate');
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: false,
			});
			
			editor.getSession().setMode('ace/mode/javascript');
			
			ngModel.$render = () =>
			{
				var shouldDeselect = editor.getValue() == '';
				
				editor.setValue(ngModel.$viewValue || '');
				resizeEditor(editor, elem);
				
				if(shouldDeselect)
				{
					editor.selection.clearSelection();
				}
			};
			
			editor.on('change', () =>
			{
				$timeout(() =>
				{
					scope.$apply(() =>
					{
						var value = editor.getValue();
						ngModel.$setViewValue(value);
					});
				});
				resizeEditor(editor, elem);
			});
		}
	};
})

.value('Input', [])
.value('Output', {status: null})

.factory('Settings', function()
{
	return {
		autorun: true,
		autoreturn: true,
	};
})

.factory('Buffer', function()
{
	return class Buffer
	{
		constructor()
		{
			this.waiting = 0;
			this.callbacks = [];
		}
		
		run(callback)
		{
			if(this.waiting)
			{
				this.callbacks.push(callback);
			}
			else
			{
				callback();
			}
		}
		
		hold()
		{
			this.waiting++;
		}
		
		resume()
		{
			if(this.waiting > 0)
			{
				this.waiting--;
				if(!this.waiting)
				{
					for(var i = 0; i < this.callbacks.length && !this.waiting; i++)
					{
						this.callbacks.shift()();
					}
				}
			}
			else throw 'Buffer unlocked extraneously';
		}
	}
})

.factory('Sandbox', function()
{
	var sandbox = document.createElement('iframe');
	sandbox.hidden = true;
	document.body.appendChild(sandbox);
	
	return {
		element: sandbox,
		window: sandbox.contentWindow,
	};
})

.service('EvalService', function($http, Input, Output, Settings, Buffer, Sandbox, SerializerService)
{
	var scriptBuffer = new Buffer();
	
	Sandbox.window.E = window.E;
	
	var imports = [];
	this.addImport = (path) =>
	{
		if(~imports.indexOf(path)) return;
		imports.push(path);
		
		scriptBuffer.run(() =>
		{
			scriptBuffer.hold();
		
			$http.get(path + '.js').then(
				(response) =>
				{
					console.log('[import] ' + path);
					
					try {Sandbox.window.eval(response.data)}
					catch(e) {console.error(e.stack)}
					finally {scriptBuffer.resume()}
				}, () =>
				{
					Output.status = 'Failed to load script from ' + path;
					scriptBuffer.unlock();
				});
		});
	}
	
	this.evaluate = (script) =>
	{
		scriptBuffer.run(() =>
		{
			for(var key in Input)
			{
				Sandbox.window[key] = Input[key].value;
			}
			
			try
			{
				if(Settings.autoreturn)
				{
					script = script.trim();
					var splitIndex = script.lastIndexOf('\n') + 1;
					var endLine = script.substring(splitIndex).trim();
					
					if(!/^((return|for|if|while)[\(\s]|var|let|const|\}|\)|\.)/.test(endLine))
					{
						script = script.substring(0, splitIndex) + 'return ' + endLine;
					}
				}
			
				Output.current = false;
				
				delete Sandbox.window.output;
				var returnValue = Sandbox.window.eval('(function run() {\n' + script + '\n})()');
				
				var evalResult = Sandbox.window.output;
				if(evalResult === undefined) evalResult = returnValue;
				
				Output.current = true;
				Output.status = null;
				Output.result = SerializerService.serialize(evalResult);
			}
			catch(e)
			{
				Output.status = e.name == 'SyntaxError' ? null : e.message;
			}
		});
	}
})

.service('SerializerService', function()
{
	this.serialize = (value) =>
	{
		if(typeof value == 'string') return value;
		if(typeof value == 'number' || typeof value == 'boolean') return value.toString();
		if(value === undefined) return;
		if(value === null) return 'null';
		if(typeof value == 'function') return value.toString();
		if(Array.isArray(value)) return value.join('\n');
		
		return Object.keys(value).map(k => '<b>' + k + '</b>: ' + this.serializeProperty(value[k])).join('\n');
	}
	
	this.serializeProperty = (value) =>
	{
		if(typeof value == 'string') return '\'' + value + '\'';
		if(typeof value == 'number' || typeof value == 'boolean') return value.toString();
		if(!value || typeof value == 'function') return String(value);
		if(Array.isArray(value)) return '<b>[</b>' + value.join(' ') + '<b>]</b>';
		if(Object.getPrototypeOf(Object.getPrototypeOf(value)) != null) return value.toString();
		
		return '<b>{</b>' + Object.keys(value).map(k => '\'' + k + '\': ' + value[k]).join(', ') + '<b>}</b>';
	}
})
