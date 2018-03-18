(function() {
    if (window.radarioQuestionary === undefined) {
        console.error("radarioQuestionary have not been initialized :(");
    } else {
        var _Q = window.radarioQuestionary;
        var pickNextQuestion = function() {
            var q = null;
            try {
                q = _Q.questions[_Q.i];
                _Q.i++;
            } catch(e) {}
            _Q.ctx = q;
            return q;
        };
        var processToResults = function() {
            var rank = 1;
            var rankDescription = 'Пожалуй, вам стоит приоткрыть занавес и познакомиться с миром театра поближе.';
            if (_Q.score > 3) {
                rank++;
            }
            if (_Q.score > 6) {
                rank++;
                rankDescription = 'Вы знаете многое об истории театра – это впечатляет!';
            }
            if (_Q.score > 9) { 
                rank++;
                rankDescription = 'Вы настоящий знаток истории театра и наверняка частенько бываете в закулисье!';
            }
            var context = {
                rank: rank,
                progress: _Q.score.toString() + ' / ' + _Q.questions.length.toString(),
                rankDescription: rankDescription
            };
            $(".mainbox").replaceWith(_Q.finishTemplate(context));
        };
        var loadQuestion = function(questionObject) {
            if (questionObject == null) {
                processToResults(); //there is no more questions left
                return;
            }
            if (questionObject.questionType == 'pickOne') {
                var context = {
                    progress: _Q.i.toString() + ' / ' + _Q.questions.length.toString(),
                    headerImage: questionObject.headerImage,
                    question: questionObject.headerText,
                    source: questionObject.source,
                    q1: questionObject.variants.a,
                    q2: questionObject.variants.b,
                    q3: questionObject.variants.c,
                    q4: questionObject.variants.d
                };
                $(".mainbox").replaceWith(_Q.pickOneTemplate(context));
                return;
            }
            if (questionObject.questionType == 'selectize') {
                var selectHTML = '<select class="selectone" onchange="radarioQuestionary.pick(this)"><option disabled selected>Выберите вариант</option>';
                var s = questionObject.variants.initalSelectize;
                for(var i = 0; i < s.length; i++) {
                    selectHTML += '<option>' + s[i].toString() + '</option>';
                }
                selectHTML += '</select>'
                var context = {
                    progress: _Q.i.toString() + ' / ' + _Q.questions.length.toString(),
                    headerImage: questionObject.headerImage,
                    question: questionObject.headerText,
                    source: questionObject.source,
                    q1: questionObject.variants.a,
                    q2: questionObject.variants.b,
                    q3: questionObject.variants.c,
                    q4: questionObject.variants.d,
                    formedSelect: selectHTML
                };
                $(".mainbox").replaceWith(_Q.selectizeTemplate(context));
                return;
            }
            console.error("Unknown question type");
        }
        var processMechanique1 = function(chosenAnswer) {
            var idx = chosenAnswer.charCodeAt(0) - 'a'.charCodeAt(0);
            var variants = $(".variant");
            for(var i = 0; i < variants.length; i++) {
                var classToAdd = 'inactive'
                var vr = String.fromCharCode('a'.charCodeAt(0) + i);
                if (_Q.ctx.variants[vr].isCorrect) {
                    classToAdd = 'ok';
                }
                if (i == idx) {
                    if (_Q.ctx.variants[chosenAnswer].isCorrect) {
                        classToAdd = 'ok';
                        _Q.score++;
                    } else {
                        classToAdd = 'wrong';
                    }
                    $(variants[i]).append('<div class="more">' + _Q.ctx.variants[chosenAnswer].selectText + '</div>');
                }
                $(variants[i]).addClass(classToAdd);
                $(variants[i]).children(".variant-mark").addClass(classToAdd);
            }
        }
        var processMechanique2 = function() {
            var selections = $('.selectone option:selected');
            var incrementScore = true;
            for(var i = 0; i < selections.length; i++) {
                var getterKey = $(selections[i]).parent().siblings("input").val();
                var selectedValue = $(selections[i]).val()
                var correctValue = radarioQuestionary.ctx.variants[getterKey].correctValue;
                var $photolabel = $(selections[i]).parent().siblings("div");
                if (selectedValue == correctValue) {
                    $photolabel.addClass('photolable-ok').html('Верно! <br> &nbsp;');
                } else {
                    $photolabel.addClass('photolable-wrong').html('Правильный вариант: <br>' + correctValue);
                    incrementScore = false;
                }
                $photolabel.show();
            }
            if (incrementScore) {
                radarioQuestionary.score++;
            }
        }
        _Q.pick = function(variant) {
            if (variant != null && _Q.ctx != null) {
                if (_Q.ctx.questionType == 'selectize') {
                    if ($('.selectone option:selected[disabled]').length >= 0) {
                        if (typeof(variant) === "object") {
                            var $el = $(variant);
                            $el.prop("disabled", "disabled");
                            $('option:contains("'+$el.val()+'")').filter(":not(:selected)").remove();
                        }
                        if ($('.selectone option:selected[disabled]').length > 0) {
                            return; //not everything selected yet.
                        }
                    }
                    processMechanique2();
                }
                if (_Q.ctx.questionType == 'pickOne') {
                    processMechanique1(variant);
                }
                _Q.ctx = null;
            }
            $('.btn-container').show();
            $('.btn').click(function() {
                loadQuestion(pickNextQuestion());
            })
        }
        _Q.pick();
    }
}());