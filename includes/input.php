<?php
   class filter {
      private $f;
      
      function __construct(callable $f) {
         $this->f = $f;
      }
      
      function __invoke($v) {
         return ($this->f)($v);
      }
   };

   class input {
      private $status = true;
      private $salida = [ ];
      
      function validate($entrada, $campo, ?filter $filtro = null, $nulable = false) {
         list($campo_original, $campo_destino) = (is_string($campo) ? [ $campo, $campo] : [ array_keys($campo)[0], array_values($campo)[0] ] );
         if (array_key_exists($campo_original, $entrada)) {
            if (!isset($filtro)) {
               $this->salida[$campo_destino] = $entrada[$campo_original];
               return true;
            }
            
            $res = $filtro($entrada[$campo_original]);
            if (isset($res)) {
               $this->salida[$campo_destino] = $res;
               return true;
            }
         }
         
         if ($nulable) {
            $this->salida[$campo_destino] = null;
            return true;
         }
         
         return $this->status = false;
      }
      
      function status( ) {
         return $this->status;
      }
      
      function output($nombre = null) {
         return (isset($nombre) ? $this->salida[$nombre] : $this->salida);
      }
   }
      
   function make_filter($predicado) {
      return new filter(fn($variable) => ($predicado($variable) ? $variable : null));
   }
   
   function builtin_filter($filtro) {
      return new filter(fn($variable) => (filter_var($variable, $filtro, [ 'flags' => FILTER_NULL_ON_FAILURE ])));
   }
   
   function callback_filter($filtro, $valor_error = null) {
      return new filter(function($variable) use ($filtro, $valor_error) {
         $variable = $filtro($variable);
         return ($variable !== $valor_error ? $variable : null);
      });
   }
   
   function date_filter($posproceso = null) {
      return new filter(function($variable) use ($posproceso) {
         $variable = @date_parse($variable);
         if ($variable !== false) {
            return (isset($posproceso) ? $posproceso($variable) : $variable);
         }
      });
   }
   
   function json_filter($posproceso = null) {
      return new filter(function($variable) use ($posproceso) {
         $variable = @json_decode($variable, true);
         if (json_last_error( ) == JSON_ERROR_NONE) {
            return (isset($posproceso) ? $posproceso($variable) : $variable);
         }
      });
   }
   
   function make_predicate($filtro) {
      return fn($variable) => (filter_var($variable, $filtro, [ 'flags' => FILTER_NULL_ON_FAILURE ]) !== null);
   }
   
   function match_predicate(...$valores) {
      return fn($variable) => (in_array($variable, $valores));
   }
   
   function regex_predicate($regex) {
      return fn($variable) => (preg_match($regex, $variable));
   }

   function array_predicate($pred, $min_arity = 0) {
      return function($variable) use ($pred, $min_arity) {
         if (!is_array($variable) || count($variable) < $min_arity) {
            return false;
         }
         foreach ($variable as $valor) {
            if (!$pred($valor)) {
               return false;
            }
         }
         return true;
      };
   }
   
   function assoc_predicate($pred_k, $pred_v, $min_arity = 0) {
      return function($variable) use ($pred_k, $pred_v, $min_arity) {
         if (!is_array($variable) || count($variable) < $min_arity) {
            return false;
         }
         foreach ($variable as $clave => $valor) {
            if (!$pred_k($clave) || !$pred_v($valor)) {
               return false;
            }
         }
         return true;
      };
   }
   
   function all_array_keys_exist($claves, $arr) {
      foreach ($claves as $clave) {
         if (!array_key_exists($clave, $arr)) {
            return false;
         }
      }
      return true;
   }
?>