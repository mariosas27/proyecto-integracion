<?php
   class db_access {
      private $handle;
      private $error;
      
      function __construct($host, $user, $pass, $db, $report = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT) {
         if ($report != null) {
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
         }
         $this->handle = mysqli_init( );
         $this->handle->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);
         $this->handle->real_connect($host, $user, $pass, $db, null, null, MYSQLI_CLIENT_FOUND_ROWS);
         $this->handle->set_charset('utf8');
      }

      function __get($propiedad) {
         return $this->handle->{$propiedad};
      }
      
      function __call($funcion, $args) {
         return call_user_func_array([ $this->handle, $funcion ], $args);
      }

      function query($query, ...$parametros) {
         return $this->fetch_result($this->handle->query($this->make_query($query, ...$parametros)));
      }
      
      function multi_query($query, ...$parametros) {
         $this->handle->multi_query($this->make_query($query, ...$parametros));
         $res = [ ];
         do {
            $res[] = $this->fetch_result($this->handle->store_result( ));
         } while ($this->handle->more_results( ) && $this->handle->next_result( ));
         return $res;
      }

      private function escape_value($valor) {
         if ($valor === null) {
            return 'null';
         } else if (is_object($valor) || is_string($valor)) {
            return '"'.$this->handle->escape_string($valor).'"';
         } else if (is_bool($valor)) {
            return ($valor ? '1' : '0');
         } else if (is_int($valor) || is_float($valor)) {
            return $valor;
         }
      }
      
      private function make_query($query, ...$parametros) {
         $placeholders = [ ]; $offset = 0;
         while (($pos = strpos($query, '?', $offset)) !== false) {
            $placeholders[] = $pos;
            $offset = $pos + 1;
         }
         
         if (count($placeholders) == count($parametros)) {
            for ($i = count($placeholders) - 1; $i >= 0; --$i) {
               $query = substr_replace($query, $this->escape_value($parametros[$i]), $placeholders[$i], 1);
            }
            return $query;
         }
      }
      
      private function fetch_result($res) {
         return (is_object($res) ? $res->fetch_all(MYSQLI_ASSOC) : $res);
      }
   }
?>