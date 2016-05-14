/* global angular */
angular.module('chemthings', ['ngSanitize'])

.component('app', {
	templateUrl: 'component/app.html',
	controller($interval, Input, Output, EvalService)
	{
		Input.push({}, {});
		
		this.autorun = true;
		
		this.script = window.localStorage.getItem('lastScript') || '';
		
		this.input = Input;
		this.output = Output;
		
		this.onType = () =>
		{
			saveCt = 100;
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
		
		var saveCt = 0;
		$interval(() =>
		{
			if(saveCt > 0)
			{
				saveCt -= 100;
				if(saveCt <= 0)
				{
					this.saveScript();
					if(this.autorun) this.evalSilent();
				}
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
			
			var Range = require('ace/range').Range;
			
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

.service('EvalService', function(Input, Output, SerializerService)
{
	var sandbox = null;
	
	sandbox = document.createElement('iframe');
	sandbox.hidden = true;
	document.body.appendChild(sandbox);
	
	/* global E */
	sandbox.contentWindow.E = E;
	sandbox.contentWindow.input = [];
	
	this.evaluate = (script) =>
	{
		for(var key in Input)
		{
			sandbox.contentWindow[key] = Input[key].value;
		}
		
		Output.status = null;
		
		try
		{
			Output.current = true;
			sandbox.contentWindow.output = {};
			var evalResult = sandbox.contentWindow.eval('(function run() {\n' + script + '\n})()');
			
			if(evalResult === undefined) evalResult = sandbox.contentWindow.output;
			Output.result = SerializerService.deserialize(evalResult);
		}
		catch(e)
		{
			Output.current = false;
			Output.status = e.message;
		}
	}
})

.service('SerializerService', function()
{
	this.serialize = (string, type) =>
	{
		if(type == 'string') return string;
		if(type == 'element') return E(string);
		return string;
	}
	
	this.deserialize = (value) =>
	{
		if(value === undefined) return;
		if(value === null) return 'null';
		if(typeof value == 'string') return value;
		if(Array.isArray(value)) return value.join('\n');
		
		return Object.keys(value).map(k => '<b>' + k + '</b>: ' + value[k]).join('\n');
	}
})